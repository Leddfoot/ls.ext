package no.deichman.services.service;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.patch.Patch;
import no.deichman.services.patch.PatchObject;
import no.deichman.services.patch.PatchParser;
import no.deichman.services.patch.PatchParserException;
import no.deichman.services.repository.RDFRepository;
import no.deichman.services.repository.SPARQLQueryBuilder;
import no.deichman.services.uridefaults.BaseURI;

/**
 * Responsibility: TODO.
 */
public final class ServiceImpl implements Service {

    private final RDFRepository repository;
    private final KohaAdapter kohaAdapter;
    private final BaseURI baseURI;
    private final Property recordID;

    public ServiceImpl(BaseURI baseURI, RDFRepository repository, KohaAdapter kohaAdapter){
        this.baseURI = baseURI;
        recordID = ResourceFactory.createProperty(this.baseURI.ontology() + "recordID");
        this.repository = repository;
        this.kohaAdapter = kohaAdapter;
    }

    @Override
    public Model retrieveWorkById(String id) {

        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkById(id));

        return m;
    }

    @Override
    public Model retrievePublicationById(String id) {

        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrievePublicationById(id));

        return m;
    }


    @Override
    public void updateWork(String work) {
        repository.updateWork(work);
    }

    @Override
    public Model retrieveWorkItemsById(String id) {
        Model allItemsModel = ModelFactory.createDefaultModel();

        Model workModel = repository.retrieveWorkById(id);
        QueryExecution queryExecution = QueryExecutionFactory.create(QueryFactory.create(
                "PREFIX  deichman: <" + baseURI.ontology() + "> "
                        + "SELECT  * "
                        + "WHERE { ?publicationUri deichman:recordID ?biblioId }"), workModel);
        ResultSet publicationSet = queryExecution.execSelect();

        while (publicationSet.hasNext()) {
            QuerySolution solution =  publicationSet.next();
            RDFNode publicationUri = solution.get("publicationUri");
            String biblioId = solution.get("biblioId").asLiteral().getString();

            Model itemsForBiblio = kohaAdapter.getBiblio(biblioId);

            SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(baseURI);
            Query query = sqb.getItemsFromModelQuery(publicationUri.toString());
            QueryExecution qexec = QueryExecutionFactory.create(query, itemsForBiblio);
            Model itemsModelWithBlankNodes = qexec.execConstruct();

            allItemsModel.add(itemsModelWithBlankNodes);
        }
        return allItemsModel;
    }

    @Override
    public String createWork(String work) {
        return repository.createWork(work);
    }

    @Override
    public String createPublication(String publication) throws Exception {
        String recordId = kohaAdapter.getNewBiblio();
        return repository.createPublication(publication, recordId);
    }

    @Override
    public void deleteWork(Model work) {
        repository.delete(work);
    }

    @Override
    public void deletePublication(Model publication) {
        repository.delete(publication);
    }

    @Override
    public Model patchWork(String workId, String requestBody) throws PatchParserException {
        PatchParser patchParser = new PatchParser();
        try {
            patchParser.setPatchData(requestBody);
        } catch (Exception e) {
            throw new PatchParserException("Bad request");
        }
        List<PatchObject> patch = patchParser.parsePatch();
        List<Patch> patches = new ArrayList<Patch>();
        Iterator<PatchObject> iter = patch.iterator();
        while (iter.hasNext()) {
            patches.add(iter.next().toPatch());
        }
        repository.patch(patches);
        return retrieveWorkById(workId);
    }

    @Override
    public Model patchPublication(String publicationId, String requestBody) throws PatchParserException {
        PatchParser patchParser = new PatchParser();
        try {
            patchParser.setPatchData(requestBody);
        } catch (Exception e) {
            throw new PatchParserException("Bad request");
        }
        List<PatchObject> patch = patchParser.parsePatch();
        List<Patch> patches = new ArrayList<Patch>();
        Iterator<PatchObject> iter = patch.iterator();
        while (iter.hasNext()) {
            patches.add(iter.next().toPatch());
        }
        repository.patch(patches);
        return retrievePublicationById(publicationId);

    }

    @Override
    public boolean resourceExists(String resourceUri) {
        return repository.askIfResourceExists(resourceUri);
    }
}
