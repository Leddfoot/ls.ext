package no.deichman.services.entity.z3950;

/**
 * Responsibility: map data from external resources to internal anonymous RDF.
 */
public final class Mapper {

    public Result map(String sourceName, String recordSet) throws Exception {
        Target target = Target.valueOf(sourceName.toUpperCase());
        Result result = new Result();
        MARCMapper marcMapper = new MARCMapper();
        result.setSource(target.getDatabaseName());

        if (target.getDataFormat().contains("marc")) {
            result.setHits(marcMapper.getMapping(recordSet));
        } else {
            throw new Exception("No mapper identified for this resource");
        }
        return result;
    }
}
