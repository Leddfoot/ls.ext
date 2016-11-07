package no.deichman.services.entity;

import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;

/**
 * Responsibility: TODO.
 */
public interface EntityService {
    
    void updateWork(String work);
    Model retrieveById(XURI xuri);
    Model retrieveWorkWithLinkedResources(XURI xuri);
    Model retrievePersonWithLinkedResources(XURI xuri);

    Model retrieveCorporationWithLinkedResources(XURI xuri);

    XURI updateHoldingBranches(String recordId, String branches) throws Exception;

    Model retrieveWorkItemsByURI(XURI xuri);
    String create(EntityType type, Model inputModel) throws Exception;
    void create(Model inputModel) throws Exception;
    void delete(Model model);
    Model patch(XURI xuri, String ldPatchJson) throws Exception;

    Model synchronizeKoha(XURI xuri) throws Exception;

    boolean resourceExists(XURI xuri);

    Model retrieveWorksByCreator(XURI xuri);

    void retrieveAllWorkUris(String type, Consumer<String> uriConsumer);

    Optional<String> retrieveImportedResource(String id, String type);

    List<String> retrieveWorkRecordIds(XURI xuri);

    Map<String, Integer> getNumberOfRelationsForResource(XURI uri);

    Model retrieveResourceByQuery(EntityType entityType, Map<String, String> queryParameters, Collection<String> projection);
}
