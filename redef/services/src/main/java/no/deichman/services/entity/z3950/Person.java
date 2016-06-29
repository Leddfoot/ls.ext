package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;
import org.apache.jena.vocabulary.RDF;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Responsibility: create a basic person object.
 */
public class Person extends ExternalDataObject {

    @SerializedName("deichman:name")
    private String name;

    @SerializedName("deichman:birthYear")
    private String birthYear;

    @SerializedName("deichman:deathYear")
    private String deathYear;

    public final String getName() {
        return name;
    }

    public final void setName(String name) {
        this.name = name;
    }


    Person() {
        setType("deichman:Person");
    }
    Person(String id, String name, String dates) {
        setType("deichman:Person");
        setId(id);
        this.name = name;
        setDates(dates);
    }

    final Map<String, String> getPersonMap() {
        Map<String, String> personMap = new HashMap<>();
        personMap.put(RDF.type.getURI(), "http://deichman.no/ontology#Person");
        String baseURI = "http://deichman.no/ontology#";
        personMap.put(baseURI + "name", getName());
        personMap.put(baseURI + "birthYear", getBirthYear());
        personMap.put(baseURI + "deatYear", getDeathYear());
        return personMap;
    }

    final void setDates(String dates) {
        List<String> dateList = Arrays.asList(dates.split("-"));
        Collections.sort(dateList);

        if (dateList.size() > 0) {
            Optional.ofNullable(dateList.get(0)).ifPresent(this::setBirthYear);
        }
        if (dateList.size() > 1) {
            Optional.ofNullable(dateList.get(1)).ifPresent(this::setDeathYear);
        }
    }

    public final String getBirthYear() {
        return birthYear;
    }

    public final void setBirthYear(String birthYear) {
        this.birthYear = birthYear;
    }

    public final String getDeathYear() {
        return deathYear;
    }

    public final void setDeathYear(String deathYear) {
        this.deathYear = deathYear;
    }
}
