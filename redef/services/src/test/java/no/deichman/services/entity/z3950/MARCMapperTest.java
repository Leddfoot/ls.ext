package no.deichman.services.entity.z3950;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.utils.ResourceReader;
import org.junit.Test;
import uk.co.datumedge.hamcrest.json.SameJSONAs;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

/**
 * Responsibility: test that marc is mapped as expected.
 */
public class MARCMapperTest extends MappingTester {

    @Test
    public void it_has_constructor() {
        assertNotNull(new MARCMapper());
    }

    @Test
    public void it_can_map_marc() {
        String marc = new ResourceReader().readFile("BS_external_data.xml");
        List<Object> mapping = new MARCMapper().getMapping(marc);
        assertNotNull(mapping);
    }

    @Test
    public void it_maps_marc_with_work() {
        checkMapping("BS_external_data_with_work.xml", "BS_external_with_work_raw_mapping.json");
    }

    @Test
    public void it_maps_marc_with_extent() {
        checkMapping("BS_external_data_with_extent.xml", "BS_external_with_extent.json");
    }

    @Test
    public void it_maps_bible() {
        checkMapping("BS_external_data_bible.xml", "BS_external_data_bible.json");
    }

    private void checkMapping(String marcXmlFile, String jsonFile) {
        String marc = new ResourceReader().readFile(marcXmlFile);
        List<Object> mapping = new MARCMapper(true).getMapping(marc);
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        assertEquals(simplifyBNodes(new ResourceReader().readFile(jsonFile)), simplifyBNodes(gson.toJson(mapping)));
        assertThat(simplifyBNodes(new ResourceReader().readFile(jsonFile)),
                SameJSONAs.sameJSONAs(simplifyBNodes(gson.toJson(mapping)))
                        .allowingExtraUnexpectedFields()
                        .allowingAnyArrayOrdering());
    }
}
