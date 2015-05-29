package no.deichman.services.ontology;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;

import no.deichman.services.uridefaults.BaseURIDefault;

public class OntologyDefault implements Ontology {
	
	String ontology = null;
	
	public OntologyDefault() throws IOException {
		InputStream in = this.getClass().getClassLoader().getResourceAsStream("ontology.ttl");
		String turtle = IOUtils.toString(in);
		ontology = turtle.replace("http://data.deichman.no/lsext-model#",BaseURIDefault.getOntologyURI());
	}
	
	public InputStream toInputStream() {
		return new ByteArrayInputStream(ontology.getBytes(StandardCharsets.UTF_8));     
	}
	
	public String toString() {
		return ontology;
	}

}
