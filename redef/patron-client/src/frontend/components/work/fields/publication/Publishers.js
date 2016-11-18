import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Publishers = ({ publishers }) => {
  if (publishers.length > 0) {
    return (
      <MetaItem label={messages.publishers} data-automation-id="publication_publishers">
        {publishers.map(publisher => publisher.name).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

Publishers.defaultProps = {
  publishers: []
}

Publishers.propTypes = {
  publishers: PropTypes.array.isRequired
}

export const messages = defineMessages({
  publishers: {
    id: 'Publishers.publishers',
    description: 'Label for publishers meta',
    defaultMessage: 'Publishers'
  }
})

export default Publishers
