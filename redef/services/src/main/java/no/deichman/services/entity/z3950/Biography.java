package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map biography form codes to rdf.
 */
public final class Biography {
    private Biography() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("1", "biographicalContent")
            .put("a", "autobiography")
            .put("b", "singleBiograpy")
            .put("c", "collectiveBiography")
            .put("d", "biographicalInformation")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
