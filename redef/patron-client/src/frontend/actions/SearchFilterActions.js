import { push } from 'react-router-redux'

export function setFilter (aggregation, bucket, active, router) {
  return (dispatch, getState) => {
    let queryParamName = 'filter_' + aggregation
    let locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ queryParamName ]
    if (active) {
      if (queryParam && Array.isArray(queryParam)) {
        if (queryParam.indexOf(bucket) === -1) {
          queryParam.push(bucket)
        }
      } else if (queryParam && queryParam !== bucket) {
        locationQuery[ queryParamName ] = [ queryParam, bucket ]
      } else {
        locationQuery[ queryParamName ] = bucket
      }
    } else {
      if (queryParam && Array.isArray(queryParam)) {
        if (queryParam.indexOf(bucket) >= 0) {
          queryParam.splice(queryParam.indexOf(bucket), 1)
        }
      } else if (queryParam === bucket) {
        delete locationQuery[ queryParamName ]
      }
    }
    delete locationQuery[ 'page' ]
    let url = router.createPath({ pathname: '/search', query: locationQuery })
    return dispatch(push(url))
  }
}
