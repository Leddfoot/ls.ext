import graph from 'ld-graph'
import urijs from 'urijs'

export function parsePersonResponse (personUri, personResponse, worksResponse) {
  let personGraph = worksResponse
    ? graph.parse(worksResponse, personResponse)
    : graph.parse(personResponse)
  let personResource = personGraph.byId(personUri)
  let person = {}

  populate(person, 'personTitle', personResource)
  populate(person, 'name', personResource)
  populate(person, 'birthYear', personResource)
  populate(person, 'deathYear', personResource)
  populateLabel(person, 'nationality', personResource)

  person.works = []
  personGraph.byType('Work').forEach(workResource => {
    let work = {}
    populateLabelsByLanguage(work, 'mainTitle', workResource)
    populateLabelsByLanguage(work, 'partTitle', workResource)
    work.relativeUri = urijs(workResource.id).path()
    person.works.push(work)
  })

  person.uri = personUri

  return person
}

export function parseWorkResponse (workUri, workResponse, itemsResponse) {
  let workGraph = itemsResponse
    ? graph.parse(workResponse, itemsResponse)
    : graph.parse(workResponse)

  let workResource = workGraph.byId(workUri)
  let work = {}

  // TODO: availCount
  populateLabelsByLanguage(work, 'mainTitle', workResource)
  populateLabelsByLanguage(work, 'partTitle', workResource)
  populate(work, 'publicationYear', workResource)

  work.creators = []
  workResource.outAll('creator').forEach(creatorResource => {
    let creator = {}
    populate(creator, 'name', creatorResource)
    creator.relativeUri = urijs(creatorResource.id).path()
    work.creators.push(creator)
  })

  work.publications = []
  work.items = []
  workGraph.byType('Publication').forEach(publicationResource => {
    let publication = {}
    populate(publication, 'mainTitle', publicationResource)
    populate(publication, 'partTitle', publicationResource)
    populate(publication, 'publicationYear', publicationResource)
    populateLabel(publication, 'language', publicationResource)
    populateLabel(publication, 'format', publicationResource)
    publication.id = publicationResource.id
    publication.itemsCount = 0
    publicationResource.inAll('editionOf').map(item => {
      publication.itemsCount++
      let i = {}
      populate(i, 'location', item)
      populate(i, 'status', item)
      populate(i, 'barcode', item)
      populate(i, 'shelfmark', item)
      i.title = publication.mainTitle
      if (publication.partTitle) {
        i.title += ' — ' + publication.partTitle
      }
      i.language = publication.language
      i.format = publication.format
      work.items.push(i)
    })
    work.publications.push(publication)
  })

  work.uri = workUri

  return work
}

function populate (target, field, sourceResource) {
  target[ field ] = ''
  if (sourceResource.has(field)) {
    target[ field ] = sourceResource.get(field).value
  }
}

function populateLabel (target, field, sourceResource) {
  target[ field ] = ''
  if (sourceResource.hasOut(field) && sourceResource.out(field).has('label')) {
    target[ field ] = sourceResource.out(field).get('label').value
  }
}

function populateLabelsByLanguage (target, field, sourceResource) {
  target[ field ] = {}
  sourceResource.getAll(field).map(literal => {
    target[ field ][ literal.lang ] = literal.value
  })
}
