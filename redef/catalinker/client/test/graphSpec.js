var assert = require('chai').assert;
var Graph = require('../src/graph.js');

var work_response_with_publications = JSON.stringify({
  "@graph": [
        {
          "@id": "http://192.168.50.12:8005/publication/p976722435911",
          "@type": "deichman:Publication",
          "deichman:format": {
            "@id": "http://data.deichman.no/format#Book"
          },
          "deichman:language": {
            "@id": "http://lexvo.org/id/iso639-3/ger"
          },
          "deichman:publicationOf": {
            "@id": "http://192.168.50.12:8005/work/w733425565188"
          },
          "deichman:mainTitle": [
                {
                  "@language": "en",
                  "@value": "elevatormusic"
                },
                "heizemuzik"
            ]
        },
        {
          "@id": "http://192.168.50.12:8005/publication/p417291955314",
          "@type": "deichman:Publication",
          "deichman:format": {
            "@id": "http://data.deichman.no/format#CD"
          },
          "deichman:language": {
            "@id": "http://lexvo.org/id/iso639-3/eng"
          },
          "deichman:publicationOf": {
            "@id": "http://192.168.50.12:8005/work/w733425565188"
          },
          "deichman:mainTitle": [
                {
                  "@language": "sv",
                  "@value": "heismusik"
                },
                "heizemuzik"
            ]
        },
        {
          "@id": "http://192.168.50.12:8005/work/w733425565188",
          "@type": "deichman:Work",
          "deichman:creator": "petter",
          "deichman:mainTitle": "heismusikk",
          "deichman:publicationYear": "1981"
        },
        {
          "@id": "http://data.deichman.no/format#CD",
          "@type": "http://data.deichman.no/utility#Format",
          "rdfs:label": {
            "@language": "no",
            "@value": "CD"
          }
        },
        {
          "@id": "http://data.deichman.no/format#Book",
          "@type": "http://data.deichman.no/utility#Format",
          "rdfs:label": {
            "@language": "no",
            "@value": "Bok"
          }
        },
        {
          "@id": "http://lexvo.org/id/iso639-3/eng",
          "@type": "http://lexvo.org/id/iso639-3/Language",
          "rdfs:label": {
            "@language": "no",
            "@value": "Engelsk"
          }
        },
        {
          "@id": "http://lexvo.org/id/iso639-3/ger",
          "@type": "http://lexvo.org/id/iso639-3/Language",
          "rdfs:label": {
            "@language": "no",
            "@value": "Tysk"
          }
        }
    ],
  "@context": {
    "deichman": "http://192.168.50.12:8005/ontology#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
  }
});

var work_response_without_publication = JSON.stringify({
  "@id": "http://192.168.50.12:8005/work/w322624890697",
  "@type": "deichman:Work",
  "deichman:creator": "blah",
  "@context": {
    "deichman": "http://192.168.50.12:8005/ontology#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
  }
});

var ìtems_response = JSON.stringify({
  "@graph": [
        {
          "@id": "_:b1",
          "@type": "deichman:Item",
          "deichman:barcode": "12345",
          "deichman:location": "HUTL",
          "deichman:status": "AVAIL"
        },
        {
          "@id": "_:b2",
          "@type": "deichman:Item",
          "deichman:barcode": "67890",
          "deichman:location": "HUTL",
          "deichman:status": "AVAIL"
        },
        {
          "@id": "_:b3",
          "@type": "deichman:Item",
          "deichman:barcode": "88654",
          "deichman:location": "HUTL",
          "deichman:status": "AVAIL"
        },
        {
          "@id": "http://192.168.50.12:8005/publication/p976722435911",
          "deichman:hasEdition": {
            "@id": "_:b1"
          }
        },
        {
          "@id": "http://192.168.50.12:8005/publication/p417291955314",
          "deichman:hasEdition": [
                {
                  "@id": "_:b2"
                },
                {
                  "@id": "_:b3"
                }
            ]
        }
    ],
  "@context": {
    "deichman": "http://192.168.50.12:8005/ontology#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
  }
});

describe("Parsing JSON-LD as a graph", function () {

  describe("with Work response but no publications", function () {

    it("can extract work from graph where graph has just one resource", function () {
      var graph = Graph.parse(work_response_without_publication);
      assert.equal(graph.works.length, 1);
      assert.equal(graph.works[0].uri, "http://192.168.50.12:8005/work/w322624890697");
      assert.equal(graph.works[0].properties.length, 1);
      assert.equal(graph.works[0].properties[0].predicate, "http://192.168.50.12:8005/ontology#creator");
      assert.equal(graph.works[0].properties[0].value, "blah");
    });

  });

  describe("with Work response and publications", function () {
    var graph = Graph.parse(work_response_with_publications);

    it("can extract works from graph", function () {
      assert.equal(graph.works.length, 1);
      var work = graph.works[0];
      assert.equal(work.uri, "http://192.168.50.12:8005/work/w733425565188");
      assert.equal(work.properties.length, 3);
      assert.equal(work.properties[0].predicate, "http://192.168.50.12:8005/ontology#creator");
      assert.equal(work.properties[0].value, "petter");
      assert.equal(work.properties[1].predicate, "http://192.168.50.12:8005/ontology#mainTitle");
      assert.equal(work.properties[1].value, "heismusikk");
      assert.equal(work.properties[2].predicate, "http://192.168.50.12:8005/ontology#publicationYear");
      assert.equal(work.properties[2].value, "1981");
    });

    it("can attach publications belonging to a work", function () {
      assert.equal(graph.works.length, 1);
      assert.equal(graph.works[0].publications.length, 2);

      var pub = graph.works[0].publications[0];
      assert.equal(pub.uri, "http://192.168.50.12:8005/publication/p976722435911");
      assert.equal(pub.properties.length, 5);
    });

    it("can filter property of a publication", function () {
      var pub = graph.works[0].publications[0];

      var name_props = pub.property("http://192.168.50.12:8005/ontology#mainTitle");
      assert.equal(name_props.length, 2);
      assert.equal(name_props[0].value, "elevatormusic");
      assert.equal(name_props[0].language, "en");
      assert.equal(name_props[0].datatype, "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
      assert.equal(name_props[1].value, "heizemuzik");
      assert.equal(name_props[1].datatype, "http://www.w3.org/2001/XMLSchema#string");
    });

    it("can filter property of a work", function () {
      var work = graph.works[0];
      var name_props = work.property(graph.resolve("deichman:mainTitle"));
      assert.equal(name_props.length, 1);
      assert.equal(name_props[0].value, "heismusikk");
    });

    it("extracts the correct resource types on work response", function () {
      var work = graph.works[0];
      assert.equal(work.resources.length, 4);
    });
  });
});

describe("with Work response, publications and items", function () {
  var graph = Graph.parse(work_response_with_publications, ìtems_response);

  it("can merge items graph into work graph", function () {
    var work = graph.works[0];
    var pub1 = work.publications[0];
    var pub2 = work.publications[1];
    assert.equal(pub1.items[0].property(graph.resolve("deichman:barcode"))[0].value, "12345");
    assert.equal(pub2.items[0].property(graph.resolve("deichman:barcode"))[0].value, "67890");
    assert.equal(pub1.items.length, 1);
    assert.equal(pub2.items.length, 2);
  });

  it("attaches items directly on work", function () {
    var work = graph.works[0];
    assert.equal(work.items.length, 3);
  });

});

