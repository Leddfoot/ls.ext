import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SearchHeader from '../components/SearchHeader'
import * as LanguageActions from '../actions/LanguageActions'
import * as LibraryActions from '../actions/LibraryActions'
import * as MobileNavigationActions from '../actions/MobileNavigationActions'
import * as WindowActions from '../actions/WindowActions'

import * as LoginActions from '../actions/LoginActions'
import ModalRoot from './ModalRoot'
import Footer from '../components/Footer'
import * as RegistrationActions from '../actions/RegistrationActions'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.handleResizeWindow = this.handleResizeWindow.bind(this)
  }

  componentWillMount () {
    this.props.loginActions.updateLoginStatus()
    this.props.languageActions.loadLanguage()
    this.props.libraryActions.fetchLibraries()
    this.props.windowActions.resizeWindow(window.innerWidth)
    window.addEventListener('resize', this.handleResizeWindow)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResizeWindow)
  }

  handleResizeWindow (event) {
    this.props.windowActions.resizeWindow(event.target.innerWidth)
  }

  render () {
    return (
      <div>
        <ModalRoot />
        <SearchHeader locationQuery={this.props.location.query}
                      dispatch={this.props.dispatch}
                      locale={this.props.locale}
                      isLoggedIn={this.props.isLoggedIn}
                      logout={this.props.loginActions.logout}
                      showLoginDialog={this.props.loginActions.showLoginDialog}
                      requireLoginBeforeAction={this.props.loginActions.requireLoginBeforeAction}
                      startRegistration={this.props.registrationActions.startRegistration}
                      showMobileNavigation={this.props.showMobileNavigation}
                      mobileNavigationActions={this.props.mobileNavigationActions}
        />
        {this.props.children}
        <Footer loadLanguage={this.props.languageActions.loadLanguage} locale={this.props.locale} />
      </div>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  routing: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  languageActions: PropTypes.object.isRequired,
  libraryActions: PropTypes.object.isRequired,
  loginActions: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  registrationActions: PropTypes.object.isRequired,
  mobileNavigationActions: PropTypes.object.isRequired,
  showMobileNavigation: PropTypes.bool.isRequired,
  windowActions: PropTypes.object.isRequired

}

function mapStateToProps (state) {
  return {
    routing: state.routing,
    locale: state.application.locale,
    isLoggedIn: state.application.isLoggedIn,
    showMobileNavigation: state.mobileNavigation.visible
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    languageActions: bindActionCreators(LanguageActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch),
    libraryActions: bindActionCreators(LibraryActions, dispatch),
    registrationActions: bindActionCreators(RegistrationActions, dispatch),
    mobileNavigationActions: bindActionCreators(MobileNavigationActions, dispatch),
    windowActions: bindActionCreators(WindowActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
