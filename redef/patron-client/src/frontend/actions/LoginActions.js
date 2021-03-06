import fetch from 'isomorphic-fetch'

import * as types from '../constants/ActionTypes'
import { showModal } from './ModalActions'
import ModalComponents from '../constants/ModalComponents'
import Errors from '../constants/Errors'
import { action } from './GenericActions'
import { fetchProfileInfo } from './ProfileActions'

export const requestLogin = (username) => action(types.REQUEST_LOGIN, { username })

export const loginSuccess = (username, borrowerNumber, borrowerName) => action(types.LOGIN_SUCCESS, {
  username,
  borrowerNumber,
  borrowerName
})

export function loginFailure (username, error) {
  return {
    type: types.LOGIN_FAILURE,
    payload: {
      username: username,
      message: error.message
    },
    error: true
  }
}

export function showLoginDialog (successAction) {
  return (dispatch, getState) => {
    if (getState().application.isLoggedIn) {
      dispatch(successAction)
    } else {
      dispatch({ type: types.SHOW_LOGIN_DIALOG })
      dispatch(showModal(ModalComponents.LOGIN, { successAction: successAction }))
    }
  }
}

export function login (username, password, successActions = []) {
  const url = '/api/v1/login'
  return dispatch => {
    dispatch(requestLogin(username))
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ username: username, password: password })
    })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        } else if (response.status === 403) {
          throw Error(Errors.login.INVALID_CREDENTIALS)
        } else {
          throw Error(Errors.login.GENERIC_LOGIN_ERROR)
        }
      })
      .then(json => {
        dispatch(loginSuccess(username, json.borrowerNumber, json.borrowerName))
        return dispatch(fetchProfileInfo())
      })
      .then(() => {
        successActions.forEach(successAction => dispatch(successAction))
      })
      .catch(error => dispatch(loginFailure(username, error)))
  }
}

export const requestLogout = () => action(types.REQUEST_LOGOUT)

export const logoutSuccess = () => action(types.LOGOUT_SUCCESS)

export const logoutFailure = (error) => action(types.LOGOUT_FAILURE, error)

export function logout () {
  const url = '/api/v1/logout'
  return dispatch => {
    dispatch(requestLogout())
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then(response => {
        if (response.status === 200) {
          dispatch(logoutSuccess())
        } else {
          dispatch(updateLoginStatus())
        }
      }).catch(message => dispatch(logoutFailure(message)))
  }
}

export const requestLoginStatus = () => action(types.REQUEST_LOGIN_STATUS)

export const receiveLoginStatus = (isLoggedIn, borrowerNumber, borrowerName, homeBranch) => action(types.RECEIVE_LOGIN_STATUS, {
  isLoggedIn,
  borrowerNumber,
  borrowerName,
  homeBranch
})

export const loginStatusFailure = (error) => action(types.LOGIN_STATUS_FAILURE, error)

export function updateLoginStatus () {
  const url = '/api/v1/loginStatus'
  return dispatch => {
    dispatch(requestLoginStatus())
    return fetch(url, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        'pragma': 'no-cache'
      },
      credentials: 'same-origin'
    }).then(response => response.json())
      .then(json => dispatch(receiveLoginStatus(json.isLoggedIn, json.borrowerNumber, json.borrowerName, json.homeBranch)))
      .catch(error => dispatch(loginStatusFailure(error)))
  }
}

export function requireLoginBeforeAction (successAction) {
  return updateLoginStatusBeforeAction(showLoginDialog(successAction))
}

export function updateLoginStatusBeforeAction (successAction) {
  const url = '/api/v1/loginStatus'
  return dispatch => {
    dispatch(requestLoginStatus())
    return fetch(url, {
      method: 'GET',
      headers: {
        'cache-control': 'no-cache',
        'pragma': 'no-cache'
      },
      credentials: 'same-origin'
    }).then(response => response.json())
      .then(json => {
        dispatch(receiveLoginStatus(json.isLoggedIn, json.borrowerNumber, json.borrowerName, json.homeBranch))
        dispatch(successAction)
      })
      .catch(error => dispatch(loginStatusFailure(error)))
  }
}
