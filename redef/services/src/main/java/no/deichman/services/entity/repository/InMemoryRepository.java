package no.deichman.services.entity.repository;

import com.hp.hpl.jena.query.Dataset;
import com.hp.hpl.jena.query.DatasetFactory;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.update.UpdateAction;
import com.hp.hpl.jena.update.UpdateRequest;
import no.deichman.services.uridefaults.BaseURI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Responsibility: Implement an in-memory RDF-repository.
 */
public final class InMemoryRepository extends RDFRepositoryBase {
    private final Dataset model;
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    public InMemoryRepository() {
        this(BaseURI.local());
    }

    public InMemoryRepository(BaseURI baseURI) {
        this(baseURI, new SPARQLQueryBuilder(baseURI), new UniqueURIGenerator(baseURI));
    }

    private InMemoryRepository(BaseURI baseURI, SPARQLQueryBuilder sqb, UniqueURIGenerator uriGenerator) {
        super(baseURI, sqb, uriGenerator);
        model = DatasetFactory.createMem();
        log.info("In-memory repository started.");
    }

    public void addData(Model newData){
        model.getDefaultModel().add(newData);
    }

    public Model getModel() {
        return model.getDefaultModel();
    }

    @Override
    protected QueryExecution getQueryExecution(Query query) {
        return QueryExecutionFactory.create(query, model);
    }

    @Override
    protected void executeUpdate(UpdateRequest updateRequest) {
        UpdateAction.execute(updateRequest, this.model);
    }
}
