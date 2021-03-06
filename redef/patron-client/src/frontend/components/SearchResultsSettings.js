import {connect} from 'react-redux'
import React, {PropTypes} from 'react'
import {defineMessages, injectIntl} from 'react-intl'

import ClickableElement from '../components/ClickableElement'

class SearchResultsSettings extends React.Component {
  shouldShowFullList () {
    const { locationQuery: { showFullList } } = this.props
    return (showFullList === null)
  }
  render () {
    return (
        <div className="search-results-settings">
          <span className="search-results-settings-label">Vis liste som:</span>
          <ClickableElement onClickAction={this.props.searchActions.toggleListView} onClickArguments={'showFullList'}>
            <button type="button">
              <span className="is-vishidden">{this.props.intl.formatMessage(messages.showFullList)}</span>
              {this.shouldShowFullList()
                ? <i className="icon-th" aria-hidden="true" style={{ fontSize: '2em' }} />
                : <i className="icon-th" aria-hidden="true" style={{ fontSize: '2em', opacity: '0.5' }} />
              }
            </button>
          </ClickableElement>
          <ClickableElement onClickAction={this.props.searchActions.toggleListView} onClickArguments={'showList'}>
            <button type="button">
              <span className="is-vishidden">{this.props.intl.formatMessage(messages.showList)}</span>
              {this.shouldShowFullList()
                ? <i className="icon-th-list" aria-hidden="true" style={{ fontSize: '2em', opacity: '0.5' }} />
                : <i className="icon-th-list" aria-hidden="true" style={{ fontSize: '2em' }} />
              }
            </button>
          </ClickableElement>
        </div>
    )
  }
}

SearchResultsSettings.propTypes = {
  searchActions: PropTypes.object.isRequired,
  locationQuery: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
}

export const messages = defineMessages({
  showFullList: {
    id: 'SearchResultSettings.showFullList',
    description: 'Show full list of search result with pictures and other data',
    defaultMessage: 'Show full search result list'
  },
  showList: {
    id: 'SearchResultSettings.showList',
    description: 'Show list of search result only with title and author',
    defaultMessage: 'Show short search result list'
  }
})

export default connect(
  null,
)(injectIntl(SearchResultsSettings))
