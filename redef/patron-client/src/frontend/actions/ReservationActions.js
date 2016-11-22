import fetch from 'isomorphic-fetch'
import * as types from '../constants/ActionTypes'
import { requireLoginBeforeAction } from './LoginActions'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import Errors from '../constants/Errors'
import * as ProfileActions from './ProfileActions'
import { action, errorAction } from './GenericActions'

export function changePickupLocation (reserveId, branchCode) {
  const url = '/api/v1/holds/'
  return dispatch => {
    dispatch(requestChangePickupLocation(reserveId, branchCode))
    return fetch(url, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reserveId, branchCode })
    })
      .then(response => {
        if (response.status === 200) {
          setTimeout(() => {
            dispatch(changePickupLocationSuccess(reserveId, branchCode))
          }, 500)
        } else {
          throw Error(Errors.reservation.GENERIC_CHANGE_PICKUP_LOCATION_ERROR)
        }
      })
      .catch(error => dispatch(changePickupLocationFailure(error)))
  }
}

export const requestChangePickupLocation = (reserveId, branchCode) => action(types.REQUEST_CHANGE_PICKUP_LOCATION, {
  reserveId,
  branchCode
})

export const changePickupLocationSuccess = (reserveId, branchCode) => action(types.CHANGE_PICKUP_LOCATION_SUCCESS, {
  reserveId,
  branchCode
})

export const changePickupLocationFailure = error => errorAction(types.CHANGE_PICKUP_LOCATION_FAILURE, error)

export function startReservation (recordId) {
  return requireLoginBeforeAction(showModal(ModalComponents.RESERVATION, { recordId: recordId }))
}

export function requestReservePublication (recordId, branchCode) {
  return {
    type: types.REQUEST_RESERVE_PUBLICATION,
    payload: {
      recordId: recordId,
      branchCode: branchCode
    }
  }
}

export function reservePublicationSuccess (recordId, branchCode) {
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, { isSuccess: true, recordId: recordId, branchCode: branchCode }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.RESERVE_PUBLICATION_SUCCESS,
      payload: {
        recordId: recordId,
        branchCode: branchCode
      }
    })
  }
}

export function reservePublicationFailure (error, recordId, branchCode) {
  console.log(error)
  return dispatch => {
    dispatch(showModal(ModalComponents.RESERVATION, {
      isError: true,
      message: error.message,
      recordId: recordId,
      branchCode: branchCode
    }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.RESERVE_PUBLICATION_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function reservePublication (recordId, branchCode) {
  const url = '/api/v1/holds'
  return dispatch => {
    dispatch(requestReservePublication(recordId, branchCode))
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recordId: recordId, branchCode: branchCode })
    })
      .then(response => {
        if (response.status === 201) {
          dispatch(reservePublicationSuccess(recordId, branchCode))
        } else if (response.status === 403) {
          throw Error(Errors.reservation.TOO_MANY_RESERVES)
        } else {
          throw Error(Errors.reservation.GENERIC_RESERVATION_ERROR)
        }
      })
      .catch(error => dispatch(reservePublicationFailure(error, recordId, branchCode)))
  }
}

export function startCancelReservation (reserveId) {
  return requireLoginBeforeAction(showModal(ModalComponents.CANCEL_RESERVATION, { reserveId: reserveId }))
}

export function requestCancelReservation (reserveId) {
  return {
    type: types.REQUEST_CANCEL_RESERVATION,
    payload: {
      reserveId: reserveId
    }
  }
}

export function cancelReservationSuccess (reserveId) {
  return dispatch => {
    dispatch(showModal(ModalComponents.CANCEL_RESERVATION, { isSuccess: true, reserveId: reserveId }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.CANCEL_RESERVATION_SUCCESS,
      payload: {
        reserveId: reserveId
      }
    })
  }
}

export function cancelReservationFailure (error, reserveId) {
  console.log(error)
  return dispatch => {
    dispatch(showModal(ModalComponents.CANCEL_RESERVATION, {
      isError: true,
      message: error.message,
      reserveId: reserveId
    }))
    dispatch(ProfileActions.fetchProfileLoans())
    dispatch({
      type: types.CANCEL_RESERVATION_FAILURE,
      payload: error,
      error: true
    })
  }
}

export function cancelReservation (reserveId) {
  const url = '/api/v1/holds'
  return dispatch => {
    dispatch(requestCancelReservation(reserveId))
    return fetch(url, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reserveId: reserveId })
    })
      .then(response => {
        if (response.status === 200) {
          dispatch(cancelReservationSuccess(reserveId))
        } else {
          throw Error(Errors.reservation.GENERIC_CANCEL_RESERVATION_ERROR)
        }
      })
      .catch(error => dispatch(cancelReservationFailure(error, reserveId)))
  }
}
