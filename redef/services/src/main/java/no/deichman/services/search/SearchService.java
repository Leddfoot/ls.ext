package no.deichman.services.search;

import no.deichman.services.uridefaults.XURI;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

/**
 * Responsibility: perform indexing and searching.
 */
public interface SearchService {
    void index(XURI xuri) throws Exception;

    void indexOnly(XURI xuri) throws Exception;

    Response searchWork(String query);

    Response searchPerson(String query);

    Response searchPersonWithJson(String json);

    Response searchWorkWithJson(String json, MultivaluedMap<String, String> queryParams);

    Response clearIndex();

    Response searchPlace(String query);

    Response searchCorporation(String query);

    Response searchSerial(String query);

    Response searchSubject(String query);

    Response searchGenre(String query);

    Response searchPublication(String query);

    Response searchPublicationWithJson(String json);

    Response searchInstrument(String query);

    Response searchCompositionType(String query);

    Response searchEvent(String query);

    void delete(XURI xuri);

}
