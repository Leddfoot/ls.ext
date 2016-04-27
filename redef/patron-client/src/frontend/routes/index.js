import React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import App from '../containers/App'
import Search from '../containers/Search'
import Work from '../containers/Work'
import Person from '../containers/Person'
import MyPage from '../containers/MyPage'
import UserLoans from '../containers/UserLoans'
import UserInfo from '../containers/UserInfo'
import UserSettings from '../containers/UserSettings'
import store from '../store'

const history = syncHistoryWithStore(browserHistory, store)

export default (
  <Router history={history}>
    <Route path='/' component={App}>
      <IndexRoute component={Search} />
      <Route path='search' component={Search} />
      <Route path='work/:workId' component={Work} />
      <Route path='work/:workId/publication/:publicationId' component={Work} />
      <Route path='person/:personId' component={Person} />
      <Route path='profile' component={MyPage}>
        <IndexRoute component={UserLoans} />
        <Route path='loans' component={UserLoans} />
        <Route path='info' component={UserInfo} />
        <Route path='settings' component={UserSettings} />
      </Route>
    </Route>
  </Router>
)
