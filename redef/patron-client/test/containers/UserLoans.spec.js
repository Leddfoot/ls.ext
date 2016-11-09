/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import UserLoans from '../../src/frontend/containers/UserLoans'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import { Provider } from 'react-redux'
import * as LibraryActions from '../../src/frontend/actions/LibraryActions'
import * as ProfileActions from '../../src/frontend/actions/ProfileActions'

function setup (propOverrides) {
  const props = {
    location: { pathname: '', query: {} },
    mediaQueryValues: { width: 992 },
    ...propOverrides
  }

  const store = createStore(rootReducer)
  const libraries = {
    'branchCode_1': 'library_1',
    'branchCode_2': 'library_2'
  }
  store.dispatch(LibraryActions.receiveLibraries(libraries))
  const loansAndReservations = {
    pickups: [
      {
        recordId: 'recordId_1',
        title: 'title_1',
        author: 'author_1',
        publicationYear: 'publicationYear_1',
        expiry: '01/10/2016',
        pickupNumber: 'pickupNumber_1',
        branchCode: 'branchCode_1'
      },
      {
        recordId: 'recordId_2',
        title: 'title_2',
        author: 'author_2',
        publicationYear: 'publicationYear_1',
        expiry: '02/10/2016',
        pickupNumber: 'pickupNumber_2',
        branchCode: 'branchCode_2'
      }
    ],
    reservations: [
      {
        recordId: 'recordId_1',
        title: 'title_1',
        author: 'author_1',
        orderedDate: '03/10/2016',
        waitingPeriod: 'waitingPeriod_1',
        branchCode: 'branchCode_1'
      },
      {
        recordId: 'recordId_2',
        title: 'title_2',
        author: 'author_2',
        orderedDate: '04/10/2016',
        waitingPeriod: 'waitingPeriod_2',
        branchCode: 'branchCode_2'
      }
    ],
    loans: [
      {
        recordId: 'recordId_1',
        title: 'title_1',
        author: 'author_1',
        publicationYear: 'publicationYear_1',
        dueDate: '01/01/2017',
        checkoutId: 'checkoutId_1'
      },
      {
        recordId: 'recordId_2',
        title: 'title_2',
        author: 'author_2',
        publicationYear: 'publicationYear_2',
        dueDate: '06/10/2016',
        checkoutId: 'checkoutId_2'
      }
    ]
  }
  store.dispatch(ProfileActions.receiveProfileLoans(loansAndReservations))

  const messages = {
    'branchCode_1': 'Branch 1',
    'branchCode_2': 'Branch 2'
  }

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <UserLoans {...props} />
      </IntlProvider>
    </Provider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output),
    store: store,
    messages: messages
  }
}

describe('containers', () => {
  describe('UserLoans', () => {
    it('should display pickups', () => {
      const { node, store, messages } = setup()
      const { loansAndReservations } = store.getState().profile
      const pickups = node.querySelectorAll("[data-automation-id='UserLoans_pickup']")
      expect(pickups.length).toEqual(2)
      Array.prototype.forEach.call(pickups, (pickup, index) => {
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_title']").textContent).toEqual(loansAndReservations.pickups[ index ].title)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_author']").textContent).toEqual(loansAndReservations.pickups[ index ].author)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_expiry']").textContent).toEqual(loansAndReservations.pickups[ index ].expiry)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_pickupNumber']").textContent).toEqual(loansAndReservations.pickups[ index ].pickupNumber)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_branch']").textContent).toEqual(messages[loansAndReservations.pickups[ index ].branchCode])
      })
    })

    it('should display reservations', () => {
      const { node, store } = setup()
      const { loansAndReservations } = store.getState().profile
      const { libraries } = store.getState().application
      const reservations = node.querySelectorAll("[data-automation-id='UserLoans_reservation']")
      expect(reservations.length).toEqual(2)
      Array.prototype.forEach.call(reservations, (reservation, index) => {
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_title']").textContent).toEqual(loansAndReservations.reservations[ index ].title)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_author']").textContent).toEqual(loansAndReservations.reservations[ index ].author)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_orderedDate']").textContent).toEqual(loansAndReservations.reservations[ index ].orderedDate)
        // expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_waitingPeriod']").textContent).toEqual(loansAndReservations.reservations[ index ].waitingPeriod)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_library']").textContent).toEqual(libraries[ loansAndReservations.reservations[ index ].branchCode ])
      })
    })

    it('should display reservations on smaller screens', () => {
      const { node, store } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const { libraries } = store.getState().application
      const reservations = node.querySelectorAll("[data-automation-id='UserLoans_reservation']")
      expect(reservations.length).toEqual(2)
      Array.prototype.forEach.call(reservations, (reservation, index) => {
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_title']").textContent).toEqual(loansAndReservations.reservations[ index ].title)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_author']").textContent).toEqual(loansAndReservations.reservations[ index ].author)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_orderedDate']").textContent).toEqual(loansAndReservations.reservations[ index ].orderedDate)
        // expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_waitingPeriod']").textContent).toEqual(loansAndReservations.reservations[ index ].waitingPeriod)
        expect(reservation.querySelector("[data-automation-id='UserLoans_reservation_library']").textContent).toEqual(libraries[ loansAndReservations.reservations[ index ].branchCode ])
      })
    })

    it('should display loans', () => {
      const { node, store } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const loans = node.querySelectorAll("[data-automation-id='UserLoans_loan']")
      expect(loans.length).toEqual(2)
      Array.prototype.forEach.call(loans, (loan, index) => {
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_title']").textContent).toEqual(loansAndReservations.loans[ index ].title)
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_author']").textContent).toEqual(loansAndReservations.loans[ index ].author)
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_publicationYear']").textContent).toEqual(loansAndReservations.loans[ index ].publicationYear)
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_dueDate']").textContent).toEqual(loansAndReservations.loans[ index ].dueDate)
      })
    })
  })
})
