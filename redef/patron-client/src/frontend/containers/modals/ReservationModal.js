import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import * as ReservationActions from '../../actions/ReservationActions'
import * as ModalActions from '../../actions/ModalActions'
import Libraries from '../../components/Libraries'

class ReservationModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleReserve = this.handleReserve.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleReserve (event) {
    event.preventDefault()
    this.props.reservationActions.reservePublication(this.props.recordId, this.librarySelect.getValue())
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id="reservation_success_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p>
          <FormattedMessage {...messages.messageSuccess} />
        </p>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id="reservation_error_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericReservationError} />}
        </p>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  render () {
    if (this.props.isError) {
      return this.renderError()
    } else if (this.props.isSuccess) {
      return this.renderSuccess()
    }
    return (
      <div data-automation-id="reservation_modal" className="default-modal">
        <form>
          <p>
            <FormattedMessage {...messages.choosePickupLocation} />
          </p>
          <Libraries ref={e => this.librarySelect = e} libraries={this.props.libraries} />
          <br />
          <br />
          <button className="black-btn" data-automation-id="reserve_button"
                  disabled={this.props.isRequestingReservation}
                  onClick={this.handleReserve}>
            <FormattedMessage {...messages.reserve} />
          </button>
          <button className="grey-btn" disabled={this.props.isRequestingReservation} onClick={this.handleCancel}>
            <FormattedMessage {...messages.cancel} />
          </button>
        </form>
      </div>
    )
  }
}

ReservationModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  reservationActions: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  libraries: PropTypes.object.isRequired,
  recordId: PropTypes.string.isRequired,
  isSuccess: PropTypes.bool,
  isError: PropTypes.bool,
  message: PropTypes.string
}

export const messages = defineMessages({
  choosePickupLocation: {
    id: 'ReservationModal.choosePickupLocation',
    description: 'The label for choosing pickup location:',
    defaultMessage: 'Choose pickup location'
  },
  reserve: {
    id: 'ReservationModal.reserve',
    description: 'The label the reserve button',
    defaultMessage: 'Reserve'
  },
  cancel: {
    id: 'ReservationModal.cancel',
    description: 'The label for the cancel button',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'ReservationModal.headerTextSuccess',
    description: 'The header text for the reservation success dialog',
    defaultMessage: 'The reservation is successful.'
  },
  messageSuccess: {
    id: 'ReservationModal.messageSuccess',
    description: 'The reservation success message',
    defaultMessage: 'You will receive a message by e-mail or SMS when it is ready for pickup.'
  },
  headerTextError: {
    id: 'ReservationModal.headerTextError',
    description: 'The header text for the reservation error dialog',
    defaultMessage: 'The reservation failed.'
  },
  genericReservationError: {
    id: 'ReservationModal.genericReservationError',
    description: 'A generic reservation error message',
    defaultMessage: 'Something went wrong when reserving #sadpanda'
  },
  tooManyReserves: {
    id: 'ReservationModal.tooManyReserves',
    description: 'The error message when the user has too many reserves',
    defaultMessage: 'Too many reserves already placed.'
  },
  button: {
    id: 'ReservationModal.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'OK'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation,
    libraries: state.application.libraries
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export { ReservationModal }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReservationModal)
