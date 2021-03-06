const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.post('/api/v1/holds', jsonParser, (request, response) => {
    fetch('http://xkoha:8081/api/v1/holds', {
      method: 'POST',
      body: JSON.stringify({
        borrowernumber: Number(request.session.borrowerNumber),
        biblionumber: Number(request.body.recordId),
        branchcode: request.body.branchCode
      })
    }).then(res => {
      if (res.status === 201) {
        response.sendStatus(201)
      } else if (res.status === 403) {
        return res.json()
      } else {
        throw Error(`Could not reserve publication ${res.status}`)
      }
    }).then(err => {
      response.status(403)
      response.send(err) // pass along Koha's error reason message to client side
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  app.delete('/api/v1/holds', jsonParser, (request, response) => {
    fetch(`http://xkoha:8081/api/v1/holds/${request.body.reserveId}`, {
      method: 'DELETE'
    }).then(res => {
      if (res.status === 200) {
        response.sendStatus(200)
      } else {
        throw Error('Could not delete reservation')
      }
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  app.patch('/api/v1/holds', jsonParser, (request, response) => {
    const reserveModifications = {}
    if (request.body.branchCode !== undefined) {
      reserveModifications.branchcode = request.body.branchCode
    }
    if (request.body.suspended !== undefined) {
      reserveModifications.suspend = request.body.suspended ? 1 : 0
    }

    if (request.body.suspendUntil !== undefined) {
      reserveModifications.suspend_until = request.body.suspendUntil
    }

    fetch(`http://xkoha:8081/api/v1/holds/${request.body.reserveId}`, {
      method: 'PATCH',
      body: JSON.stringify(reserveModifications)
    }).then(res => {
      if (res.status === 200) {
        response.sendStatus(200)
      } else {
        response.sendStatus(500)
        throw Error('Could not perform holds api operation')
      }
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })
}
