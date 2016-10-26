import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'
import MediaQuery from 'react-responsive'

import WorkInformation from '../components/work/WorkInformation'
import Publications from '../components/Publications'
import * as ResourceActions from '../actions/ResourceActions'
import * as ReservationActions from '../actions/ReservationActions'
import * as ParameterActions from '../actions/ParameterActions'
import * as SearchFilterActions from '../actions/SearchFilterActions'
import AdditionalInformationContent from '../components/work/AdditionalInformationContent'

class Work extends React.Component {
  componentWillMount () {
    this.props.resourceActions.fetchWorkResource(this.props.params.workId)
  }

  renderNoWork () {
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="wrapper">
        <FormattedMessage {...messages.noWork} />
      </ReactCSSTransitionGroup>
    )
  }

  renderEmpty () {
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="wrapper">
        <article className="work-entry loading">
          <i className="icon-spin4 animate-spin" />
        </article>
      </ReactCSSTransitionGroup>
    )
  }

  renderOriginalReleaseDate (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelOriginalReleaseDate} />: </span>
        <span className="meta-content">Placholder original release date</span>
      </div>
    )
  }

  renderPartOfSeries (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelSeries} />: </span>
        <span
          className="meta-content">{work.serials.join(', ')}</span>
      </div>
    )
  }

  renderRelations (work) {
    return (
      <div>
        {/*
         foreach relation
         */}
        {this.renderRelation(work)}
      </div>
    )
  }

  renderRelation (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelRelation} />: </span>
        <span className="meta-content">Placholder relation</span>
      </div>
    )
  }

  renderAvailableMediaTypes (publications) {
    const mediaTypes = []
    publications.forEach(publication => {
      publication.mediaTypes.forEach(mediaType => {
        if (mediaTypes.indexOf(mediaType.split('.no/').pop()) < 0) mediaTypes.push(mediaType.split('.no/').pop())
      })
    })
    return (
      <ul>
        <li>Here they come</li>
        {mediaTypes.map(mediaType => <li><Link to={mediaType}>{mediaType}</Link></li>)}
      </ul>
    )
  }

  render () {
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    const work = this.props.resources[ this.props.params.workId ]
    if (!work) {
      return this.renderNoWork()
    }

    const publicationsWithItems = work.publications.map(publication => {
      const newPublication = { ...publication, items: this.props.items[ publication.recordId ] || [] }
      newPublication.available = newPublication.items.filter(item => item.status === 'Ledig').length > 0
      return newPublication
    })

    const { back } = this.props.location.query

    return (
      <div className="wrapper">
        <ReactCSSTransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="article"
          className="work-entry">
          {back && back.startsWith('/search') // We don't want to allow arbitrary URLs in the back parameter
            ? (
            <header className="back-to-results">
              <Link to={this.props.location.query.back} alt="Back to search page">
                <i className="icon-angle-double-left" />Tilbake til søkeresultat
              </Link>
            </header>
          ) : ''}

          <WorkInformation work={work} publicationId={this.props.params.publicationId} showAdditionalInformation={this.props.showAdditionalInformation.includes(work.id)} toggleShowAdditionalInformation={this.props.resourceActions.toggleShowMoreInformation} />

          <MediaQuery query="(min-width: 992px)" values={{ ...this.props.mediaQueryValues }}>
            <AdditionalInformationContent work={work} />
          </MediaQuery>
          {/* this.renderAvailableMediaTypes(work.publications) */}

          <Publications locationQuery={this.props.location.query}
                        expandSubResource={this.props.resourceActions.expandSubResource}
                        publications={publicationsWithItems}
                        startReservation={this.props.reservationActions.startReservation}
                        toggleParameterValue={this.props.parameterActions.toggleParameterValue}
                        workLanguage={work.language}
                        libraries={this.props.libraries}
                        audiences={Array.isArray(this.props.resources[ this.props.params.workId ].audience) ? this.props.resources[ this.props.params.workId ].audience : [ this.props.resources[ this.props.params.workId ].audience ]}
                        searchFilterActions={this.props.searchFilterActions}
                        query={this.props.query} />

        </ReactCSSTransitionGroup>

      </div>
    )
  }
}

Work.propTypes = {
  resourceActions: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
  isRequesting: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  reservationActions: PropTypes.object.isRequired,
  parameterActions: PropTypes.object.isRequired,
  query: PropTypes.object.isRequired,
  searchFilterActions: PropTypes.object.isRequired,
  libraries: PropTypes.object.isRequired,
  items: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  audiences: PropTypes.array,
  mediaQueryValues: PropTypes.object
}

export const messages = defineMessages({

  noWork: {
    id: 'Work.noWork',
    description: 'When no work was found',
    defaultMessage: 'No work'
  },

  labelRelation: {
    id: 'Work.labelRelation',
    description: 'Label for relation',
    defaultMessage: 'Name of relation'
  },
  labelSeries: {
    id: 'Work.labelSeries',
    description: 'Label for series',
    defaultMessage: 'Part of series'
  },

  labelOriginalReleaseDate: {
    id: 'Work.labelOriginalReleaseDate',
    description: 'Label for original release date',
    defaultMessage: 'Original release date'
  },
  workInformation: {
    id: 'Work.workInformation',
    description: 'The header text for the work information',
    defaultMessage: 'Work information'
  }
})

function mapStateToProps (state) {
  return {
    resources: state.resources.resources,
    isRequesting: state.resources.isRequesting,
    query: state.routing.locationBeforeTransitions.query,
    libraries: state.application.libraries,
    items: state.resources.items,
    showAdditionalInformation: state.resources.showAdditionalInformation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    resourceActions: bindActionCreators(ResourceActions, dispatch),
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    parameterActions: bindActionCreators(ParameterActions, dispatch),
    searchFilterActions: bindActionCreators(SearchFilterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Work))
