const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const jsonld = require('jsonld')
const fs = require('fs')
const path = require('path')
const frame = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'misc', 'frame.json')))

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.get('/api/v1/resources/work/:workId', jsonParser, (request, response) => {
    fetch(`http://services:8005/work/${request.params.workId}`, { headers: { accept: 'application/n-triples;charset=utf-8' } })
      .then(res => {
        if (res.status === 200) {
          return res.text()
        } else {
          response.status(res.status).send(res.statusText)
          throw Error()
        }
      }).then(ntdata => jsonld.fromRDF(ntdata, { format: 'application/nquads' }, (error, ntdoc) => {
        if (error) {
          response.status(500).send(error)
        }

        // Remove type -> Work relations on all works, except the work in focus, to avoid
        // problems when work has subjects which themselves are works.
        // TODO revise this hack - it might make it difficult to present the work relations on work page.
        ntdoc = ntdoc.map(el => {
          if (el[ '@type' ] && el[ '@type' ].includes('http://data.deichman.no/ontology#Work') && el[ '@id' ] !== `http://data.deichman.no/work/${request.params.workId}`) {
            delete el[ '@type' ]
          }
          return el
        })

        jsonld.frame(ntdoc, frame, (error, framed) => {
          if (error) {
            response.status(500).send(error)
          }
          try {
            response.status(200).send(transformWork(framed[ '@graph' ][ 0 ]))
          } catch (error) {
            response.status(500).send(error)
          }
        })
      })
    ).catch(error => {
      response.sendStatus(500)
      console.log(error)
    })
  })

  app.get('/api/v1/resources/work/:workId/items', jsonParser, (request, response) => {
    fetch(`http://services:8005/work/${request.params.workId}/listRecordIds`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          response.status(res.status).send(res.statusText)
          throw Error()
        }
      }).then(json => Promise.all(json.recordIds.map(recordId => fetch(`http://xkoha:8081/api/v1/biblios/${recordId}/expanded`).then(res => res.json())))
      .then(itemResponses => {
        const itemsByRecordId = {}
        itemResponses.forEach(itemResponse => {
          const items = {}
          itemResponse.items.forEach(item => {
            const newItem = {
              shelfmark: item.itemcallnumber,
              status: item.status,
              branchcode: item.homebranch,
              barcode: item.barcode,
              location: item.location
            }
            const key = `${newItem.branchcode}_${newItem.shelfmark}_${item.location}`
            if (!items[ key ]) {
              newItem.available = 0
              newItem.total = 0
              items[ key ] = newItem
            }
            if (newItem.status === 'Ledig') {
              items[ key ].available++
            }
            items[ key ].total++
          })
          itemsByRecordId[ itemResponse.biblio.biblionumber ] = items
        })
        const itemsyo = {}
        Object.keys(itemsByRecordId).forEach(key => {
          itemsyo[ key ] = Object.keys(itemsByRecordId[ key ]).map(key2 => itemsByRecordId[ key ][ key2 ])
        })
        response.status(200).send(itemsyo)
      }).catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
    ).catch(error => {
      response.sendStatus(500)
      console.log(error)
    })
  })
}

function transformWork (input) {
  try {
    const contributors = transformContributors(input.contributors)
    const work = {
      _original: process.env.NODE_ENV !== 'production' ? input : undefined,
      audiences: input.audiences,
      biographies: input.biographies,
      by: transformBy(contributors),
      classifications: transformClassifications(input.classifications),
      compositionType: transformCompositionType(input.compositionType),
      contentAdaptations: input.contentAdaptations,
      contributors: contributors,
      deweyNumber: input.hasClassification ? input.hasClassification.hasClassificationNumber : undefined,
      fictionNonfiction: input.fictionNonfiction,
      genres: input.genres,
      hasSummary: input.hasSummary,
      id: getId(input.id),
      instruments: transformInstruments(input.hasInstrument),
      items: [],
      languages: input.languages,
      literaryForms: input.literaryForms,
      mainTitle: input.mainTitle,
      partNumber: input.partNumber,
      partTitle: input.partTitle,
      publicationYear: input.publicationYear,
      publications: transformPublications(input.publications),
      serials: transformSerials(input),
      subtitle: input.subtitle,
      subjects: input.subjects,
      uri: input.id
    }
    const publicationWithImage = work.publications.find(publication => publication.image)
    if (publicationWithImage) {
      work.image = publicationWithImage.image
    }
    return work
  } catch (error) {
    console.log(error)
  }
}

function transformPublications (publications) {
  return publications.map(publication => {
    return {
      ageLimit: publication.ageLimit,
      binding: publication.binding,
      contentAdaptations: publication.contentAdaptations,
      contributors: transformContributors(publication.contributors),
      description: publication.description,
      duration: publication.duration,
      ean: publication.ean,
      edition: publication.edition,
      extent: publication.extent,
      formatAdaptations: publication.formatAdaptations,
      formats: publication.formats,
      genres: publication.genres,
      id: getId(publication.id),
      image: publication.image,
      isbn: publication.isbn,
      items: [],
      languages: publication.languages,
      mainTitle: publication.mainTitle,
      mediaTypes: publication.mediaTypes,
      numberOfPages: publication.numberOfPages,
      partNumber: publication.partNumber,
      partTitle: publication.partTitle,
      placeOfPublication: publication.hasPlaceOfPublication ? publication.hasPlaceOfPublication.prefLabel : undefined,
      publicationParts: transformPublicationParts(publication.publicationParts),
      publicationYear: publication.publicationYear,
      publisher: publication.publishedBy ? publication.publishedBy.name : undefined,
      publishers: publication.publishers,
      recordId: publication.recordId,
      serialIssues: transformSerialIssues(publication.serialIssues),
      subtitle: publication.subtitle,
      subtitles: publication.subtitles,
      uri: publication.id
    }
  })
}

function transformPublicationParts (input) {
  try {
    return input.map(inputPublicationPart => {
      return {
        /* TODO */
      }
    })
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformSerials (work) {
  try {
    return [].concat(...work.publications.map(publication => publication.serialIssues.map(inSerial => inSerial.name)))
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformContributors (input) {
  try {
    const contributors = {}
    input.forEach(inputContributor => {
      const contributor = inputContributor.agent
      contributor.uri = contributor.id
      contributor.id = getId(contributor.id)
      contributor.relativeUri = relativeUri(contributor.uri)
      contributors[ inputContributor.role ] = contributors[ inputContributor.role ] || []
      contributors[ inputContributor.role ].push(contributor)
    })
    return contributors
  } catch (error) {
    console.log(error)
    return {}
  }
}

function transformSerialIssues (input) {
  try {
    return input.map(serialIssue => {
      return {
        uri: serialIssue.serial.id,
        name: serialIssue.serial.mainTitle,
        subtitle: serialIssue.serial.subtitle,
        issue: serialIssue.issue
      }
    })
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformBy (contributors) {
  try {
    return []
      .concat(contributors[ 'http://data.deichman.no/role#author' ])
      .concat(contributors[ 'http://data.deichman.no/role#director' ])
      .concat(contributors[ 'http://data.deichman.no/role#composer' ])
      .concat(contributors[ 'http://data.deichman.no/role#performer' ])
      .filter(by => by)
      .map(by => by.name)
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformCompositionType (hasCompositionType = []) {
  try {
    return hasCompositionType.map(compositionType => compositionType.prefLabel)
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformInstruments (hasInstrument = []) {
  try {
    return hasInstrument.map(instrument => instrument.hasInstrument.prefLabel)
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformClassifications (input) {
  try {
    return input.map(classification => classification.hasClassificationNumber)
  } catch (error) {
    console.log(error)
    return []
  }
}

const urijs = require('urijs')

function relativeUri (uri) {
  return urijs(uri).path()
}

function getId (uri) {
  return uri.substring(uri.lastIndexOf('/') + 1)
}
