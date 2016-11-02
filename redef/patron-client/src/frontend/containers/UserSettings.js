import React, { PropTypes } from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import * as ProfileActions from '../actions/ProfileActions'
import ChangePin from './forms/ChangePinForm'

class UserSettings extends React.Component {
  constructor (props) {
    super(props)
    this.handleSaveClick = this.handleSaveClick.bind(this)
  }

  handleSaveClick (event) {
    event.preventDefault()
    const profileSettings = {
      alerts: {
        reminderOfDueDate: {
          sms: this.reminderOfDueDateSmsCheckbox.checked,
          email: this.reminderOfDueDateEmailCheckbox.checked
        },
        reminderOfPickup: {
          sms: this.reminderOfPickupSmsCheckbox.checked,
          email: this.reminderOfPickupEmailCheckbox.checked
        }
      },
      receipts: {
        loans: {
          email: this.receiptOnLoansEmailCheckbox.checked
        },
        returns: {
          email: this.receiptOnReturnsEmailCheckbox.checked
        }
      }
    }
    this.props.profileActions.postProfileSettings(profileSettings)
  }

  render () {
    const { settings } = this.props
    if (this.props.isRequestingSettings || Object.keys(settings).length === 0) {
      return <div />
    } else if (this.props.settingsError) {
      return <FormattedMessage {...messages.settingsError} />
    }
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="user-settings">

        <header>
          <h1><FormattedMessage {...messages.alerts} /></h1>
        </header>

        <div className="reminders-group">
          <h2><FormattedMessage {...messages.reminderOfDueDate} /></h2>

          <div className="reminder-item">
            <input data-automation-id="UserSettings_reminderOfDueDateSms"
                   type="checkbox"
                   name="user-settings-sms-reminder"
                   id="user-settings-sms-reminder"
                   ref={e => this.reminderOfDueDateSmsCheckbox = e}
                   defaultChecked={settings.alerts.reminderOfDueDate.sms} />
            <label htmlFor="user-settings-sms-reminder">
              <span className="checkbox-wrapper">
                <i className="icon-check-empty checkbox-unchecked" aria-hidden="true" />
                <i className="icon-ok-squared checkbox-checked" aria-hidden="true" />
              </span>
              <FormattedMessage {...messages.bySms} />
            </label>
          </div>

          <div className="reminder-item">
            <input data-automation-id="UserSettings_reminderOfDueDateEmail"
                   type="checkbox"
                   name="user-settings-reminder-email"
                   id="user-settings-reminder-email"
                   ref={e => this.reminderOfDueDateEmailCheckbox = e}
                   defaultChecked={settings.alerts.reminderOfDueDate.email} />

            <label htmlFor="user-settings-reminder-email">
              <span className="checkbox-wrapper">
                <i className="icon-check-empty checkbox-unchecked" aria-hidden="true" />
                <i className="icon-ok-squared checkbox-checked" aria-hidden="true" />
              </span>
              <FormattedMessage {...messages.byEmail} />
            </label>
          </div>

          {/* "patron-placeholder"
           <input data-automation-id="??"
           type="checkbox" name="user-settings-reminder-dont-send"
           id="user-settings-reminder-dont-send"
           ref={e => this.reminderOfDueDateEmailCheckbox = e}
           defaultChecked={settings.alerts.reminderOfDueDate.email} />
           <label
           htmlFor="user-settings-reminder-email"><span></span>
           <span>Nei, ikke send</span></label> */}

        </div>

        <div className="reminders-group">
          <h2><FormattedMessage {...messages.reminderOfPickup} /></h2>
          <div className="reminder-item">
            <input data-automation-id="UserSettings_reminderOfPickupSms"
                   type="checkbox"
                   name="user-settings-delivery-reminder-sms"
                   id="user-settings-delivery-reminder-sms"
                   ref={e => this.reminderOfPickupSmsCheckbox = e}
                   defaultChecked={settings.alerts.reminderOfPickup.sms} />
            <label htmlFor="user-settings-delivery-reminder-sms">
              <span className="checkbox-wrapper">
                <i className="icon-check-empty checkbox-unchecked" aria-hidden="true" />
                <i className="icon-ok-squared checkbox-checked" aria-hidden="true" />
              </span>
              <FormattedMessage {...messages.bySms} />
            </label>
          </div>
          <div className="reminder-item">
            <input data-automation-id="UserSettings_reminderOfPickupEmail"
                   type="checkbox" name="user-settings-delivery-reminder-email"
                   id="user-settings-delivery-reminder-email"
                   ref={e => this.reminderOfPickupEmailCheckbox = e}
                   defaultChecked={settings.alerts.reminderOfPickup.email} />
            <label htmlFor="user-settings-delivery-reminder-email">
              <span className="checkbox-wrapper">
                <i className="icon-check-empty checkbox-unchecked" aria-hidden="true" />
                <i className="icon-ok-squared checkbox-checked" aria-hidden="true" />
              </span>
              <FormattedMessage {...messages.byEmail} />
            </label>
          </div>
        </div>

        <div className="reminders-group">
          <h2><FormattedMessage {...messages.receipts} /></h2>
          <div className="reminder-item">
            <input data-automation-id="UserSettings_receiptOnLoansEmail"
                   type="checkbox"
                   name="receipt-loans-email"
                   id="receipt-loans-email"
                   ref={e => this.receiptOnLoansEmailCheckbox = e}
                   defaultChecked={settings.receipts.loans.email} />
            <label htmlFor="receipt-loans-email">
              <span className="checkbox-wrapper">
                <i className="icon-check-empty checkbox-unchecked" aria-hidden="true" />
                <i className="icon-ok-squared checkbox-checked" aria-hidden="true" />
              </span>
              <FormattedMessage {...messages.loanReceipt} />
            </label>
          </div>

          <div className="reminder-item">
            <input data-automation-id="UserSettings_receiptOnReturnsEmail"
                   type="checkbox"
                   name="receipt-returns-email"
                   id="receipt-returns-email"
                   ref={e => this.receiptOnReturnsEmailCheckbox = e}
                   defaultChecked={settings.receipts.returns.email} />
            <label htmlFor="receipt-returns-email">
              <span className="checkbox-wrapper">
                <i className="icon-check-empty checkbox-unchecked" aria-hidden="true" />
                <i className="icon-ok-squared checkbox-checked" aria-hidden="true" />
              </span>
              <FormattedMessage {...messages.returnReceipt} />
            </label>
          </div>

        </div>

        <footer>
          <button className="black-btn"
                  type="button"
                  data-automation-id="UserSettings_saveButton"
                  onClick={this.handleSaveClick}>
            <FormattedMessage {...messages.save} />
          </button>
          <div className="disclaimer">
            <FormattedMessage {...messages.disclaimer} />
          </div>
        </footer>

        <ChangePin />

      </NonIETransitionGroup>
    )
  }
}

UserSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  isRequestingSettings: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  settingsError: PropTypes.object
}

export const messages = defineMessages({
  alerts: {
    id: 'UserSettings.alerts',
    description: 'The alerts header',
    defaultMessage: 'Alerts'
  },
  reminderOfDueDate: {
    id: 'UserSettings.reminderOfDueDate',
    description: 'The label for the reminder of due date options',
    defaultMessage: 'Reminder of due date?'
  },
  reminderOfPickup: {
    id: 'UserSettings.reminderOfPickup',
    description: 'The label for the reminder of pickup options',
    defaultMessage: 'Reminder of pickup?'
  },
  receipts: {
    id: 'UserSettings.receipts',
    description: 'The receipts header',
    defaultMessage: 'Receipts'
  },
  loanReceipt: {
    id: 'UserSettings.loanReceipt',
    description: 'The label for the option to receive loan receipts by email',
    defaultMessage: 'Receive a receipt for loans by email'
  },
  returnReceipt: {
    id: 'UserSettings.returnReceipt',
    description: 'The label for the option to receive return receipts by email',
    defaultMessage: 'Receive a receipt for returns by email'
  },
  save: {
    id: 'UserSettings.save',
    description: 'The label for the save button',
    defaultMessage: 'Save'
  },
  freeNotification: {
    id: 'UserSettings.freeNotification',
    description: 'The message to notify users that receipts and alerts are free',
    defaultMessage: 'Notice! All alerts and receipts are free'
  },
  bySms: {
    id: 'UserSettings.bySms',
    description: 'The label for the by SMS option',
    defaultMessage: 'By SMS'
  },
  byEmail: {
    id: 'UserSettings.byEmail',
    description: 'The label for the by email option',
    defaultMessage: 'By email'
  },
  disclaimer: {
    id: 'UserSettings.disclaimer',
    description: 'Disclaimer below submit button',
    defaultMessage: 'Note that all notifications and receipts are free of charge.'
  },
  settingsError: {
    id: 'UserSettings.settingsError',
    description: 'Shown when retrieving user settings failed',
    defaultMessage: 'Something went wrong retrieving user settings.'
  }
})

function mapStateToProps (state) {
  return {
    settingsError: state.profile.settingsError,
    isRequestingSettings: state.profile.isRequestingSettings,
    settings: state.profile.settings
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserSettings))
