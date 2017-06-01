package no.deichman.services;

import com.jamonapi.Monitor;
import com.jamonapi.MonitorFactory;
import no.deichman.services.datasource.Datasource;
import no.deichman.services.entity.CirculationResource;
import no.deichman.services.entity.EntityResource;
import no.deichman.services.entity.ResourceBase;
import no.deichman.services.marc.MarcResource;
import no.deichman.services.ontology.AuthorizedValuesResource;
import no.deichman.services.ontology.OntologyResource;
import no.deichman.services.ontology.TranslationResource;
import no.deichman.services.restutils.CORSResponseFilter;
import no.deichman.services.search.SearchResource;
import no.deichman.services.version.VersionResource;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.elasticsearch5.aggregation.BulkRequestAggregationStrategy;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.commons.io.FileUtils;
import org.apache.jena.system.JenaSystem;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.Slf4jRequestLog;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.server.handler.HandlerWrapper;
import org.eclipse.jetty.server.handler.RequestLogHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.webapp.Configuration;
import org.eclipse.jetty.webapp.WebAppContext;
import org.elasticsearch.action.bulk.BulkResponse;
import org.glassfish.jersey.server.ServerProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;

import static java.lang.String.format;
import static java.util.Arrays.asList;

/**
 * Responsibility: Start application (using embedded web server).
 */
public final class App {
    private static final int JAMON_WEBAPP_PORT = 8006;
    private static final Logger LOG = LoggerFactory.getLogger(App.class);
    private static final int SERVICES_PORT_NO = 8005;
    public static final int COMPLETION_INTERVAL = 2_000;
    private final int port;
    private Server jettyServer;
    private String kohaPort;
    private boolean inMemoryRDFRepository;
    private int jamonAppPort;
    private String elasticSearchUrl = System.getProperty("ELASTICSEARCH_URL", "http://elasticsearch:9200");
    private String z3950Endpoint;
    private static CamelContext camelContext;

    public App(int port, String kohaPort, boolean inMemoryRDFRepository, int jamonAppPort, String z3950Endpoint) {
        this.port = port;
        this.kohaPort = kohaPort;
        this.inMemoryRDFRepository = inMemoryRDFRepository;
        this.jamonAppPort = jamonAppPort;
        this.z3950Endpoint = z3950Endpoint;
        camelContext = new DefaultCamelContext();
    }

    public static CamelContext getCamelContext() {
        return camelContext;
    }

    public static void main(String[] args) {
        App app = new App(SERVICES_PORT_NO, null, false, JAMON_WEBAPP_PORT, null);
        try {
            JenaSystem.init(); // Needed to counter sporadic nullpointerexceptions because of context is not initialized.
            app.startSync();
        } catch (Exception e) {
            LOG.error("App failed to startSync:");
            e.printStackTrace(System.err);
        }
    }

    private void startSync() throws Exception {
        try {
            startAsync();
            join();
        } finally {
            stop();
        }
    }

    public void startAsync() throws Exception {
        setUpMainWebApp();
        setUpJamonWebApp();
        setUpCamelRouting();
    }

    private void setUpCamelRouting() throws Exception {
        RouteBuilder builder = new RouteBuilder() {
            public void configure() {
                final String elasticSearchHost = System.getProperty("ELASTICSEARCH_HOST", "elasticsearch");
                final String elasticsearchTcpPort = System.getProperty("ELASTICSEARCH_TCP_PORT", "9300");
                from("direct:bulkIndex")
                        .aggregate(constant(true), new BulkRequestAggregationStrategy())
                        .completionSize(Integer.parseInt(System.getProperty("ELASTICSEARCH_BULK_SIZE", "1000")))     // set bulk size here
                        .forceCompletionOnStop()
                        .completionTimeout(Integer.parseInt(System.getProperty("ELASTICSEARCH_BULK_TIMEOUT", "1000")))  // set completion timeout here
                        .to(format("elasticsearch5://elasticsearch?indexName=search&ip=%s&port=%s", elasticSearchHost, elasticsearchTcpPort))
                        .process(exchange -> {
                            final BulkResponse bulkResponse = (BulkResponse) exchange.getIn().getBody();
                            final int bulkLength = bulkResponse.getItems().length;
                            if (bulkLength > 1) {
                                LOG.info(format("Indexed bulk with %d items in %s", bulkLength, bulkResponse.getTook().toString()));
                            }
                        });
                from("direct:index")
                        .to(format("elasticsearch5://elasticsearch?indexName=search&ip=%s&port=%s", elasticSearchHost, elasticsearchTcpPort))
                        .process(exchange -> {
                            LOG.info("Indexed " + exchange.getIn().getBody().toString());
                        });
            }
        };
        camelContext.addRoutes(builder);
        camelContext.start();
    }

    private void setUpMainWebApp() throws Exception {

        jettyServer = new Server(port);
        HandlerCollection handlers = new HandlerCollection();


        handlers.addHandler(new HandlerWrapper() {
            @Override
            public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
                Monitor monitor = MonitorFactory.start(
                        "no.deichman.services  " + request.getMethod() + "   " + request.getRequestURI().replaceAll("(w|p|h|marc/)[0-9]+([/a-zA-Z])*$", "$1*******"));
                super.handle(target, baseRequest, request, response);
                monitor.stop();
            }
        });

        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        handlers.addHandler(context);

        jettyServer.setHandler(handlers);

        ServletHolder jerseyServlet = context.addServlet(
                org.glassfish.jersey.servlet.ServletContainer.class, "/*");
        jerseyServlet.setInitOrder(0);

        if (kohaPort != null) {
            jerseyServlet.setInitParameter(
                    ResourceBase.SERVLET_INIT_PARAM_KOHA_PORT,
                    kohaPort
            );
        }

        if (inMemoryRDFRepository) {
            jerseyServlet.setInitParameter(
                    ResourceBase.SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY,
                    String.valueOf(inMemoryRDFRepository)
            );
        }

        if (elasticSearchUrl != null) {
            jerseyServlet.setInitParameter(ResourceBase.ELASTIC_SEARCH_URL, elasticSearchUrl);
        }

        if (z3950Endpoint != null) {
            jerseyServlet.setInitParameter(ResourceBase.Z3950_ENDPOINT, z3950Endpoint);
        }
        // Tells the Jersey Servlet which REST service/class to load.
        jerseyServlet.setInitParameter(ServerProperties.PROVIDER_CLASSNAMES,
                String.join(",", asList(
                        EntityResource.class.getCanonicalName(),
                        OntologyResource.class.getCanonicalName(),
                        SearchResource.class.getCanonicalName(),
                        AuthorizedValuesResource.class.getCanonicalName(),
                        MarcResource.class.getCanonicalName(),
                        CORSResponseFilter.class.getCanonicalName(),
                        VersionResource.class.getCanonicalName(),
                        TranslationResource.class.getCanonicalName(),
                        Datasource.class.getCanonicalName(),
                        CirculationResource.class.getCanonicalName(),
                        ImmediateFeature.class.getCanonicalName()
                )));


        HandlerCollection collection = new HandlerCollection();
        RequestLogHandler rlh = new RequestLogHandler();
        // Slf4j - who uses anything else?
        Slf4jRequestLog requestLog = new Slf4jRequestLog();
        requestLog.setExtended(false);
        rlh.setRequestLog(requestLog);
        collection.setHandlers(new Handler[]{context, rlh});
        jettyServer.setHandler(collection);
        jettyServer.start();
        LOG.info("App started on port: " + port);
    }

    private void setUpJamonWebApp() throws Exception {
        Server jamonJettyServer = new Server(jamonAppPort);
        WebAppContext webapp = new WebAppContext();
        webapp.setContextPath("/");
        File tempFile = new File(System.getProperty("java.io.tmpdir"), "jamon.war");
        FileUtils.copyInputStreamToFile(getClass().getResourceAsStream("/jamon.war"), tempFile);
        webapp.setWar(tempFile.getAbsolutePath());

        Configuration.ClassList classlist = Configuration.ClassList
                .setServerDefault(jamonJettyServer);
        classlist.addBefore(
                "org.eclipse.jetty.webapp.JettyWebXmlConfiguration",
                "org.eclipse.jetty.annotations.AnnotationConfiguration");

        webapp.setAttribute(
                "org.eclipse.jetty.server.webapp.ContainerIncludeJarPattern",
                ".*/[^/]*servlet-api-[^/]*\\.jar$|.*/javax.servlet.jsp.jstl-.*\\.jar$|.*/[^/]*taglibs.*\\.jar$");


        jamonJettyServer.setHandler(webapp);
        jamonJettyServer.start();
    }

    private void join() throws InterruptedException {
        jettyServer.join();
    }

    public void stop() throws Exception {
        LOG.info("Stopping App on port: " + port);
        try {
            jettyServer.stop();
        } finally {
            jettyServer.destroy();
        }
    }

}
