/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilter from '../../src/frontend/components/SearchFilter'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    aggregation: 'aggregation',
    filters: [
      { id: 'language_nob', bucket: 'http://lexvo.org/id/iso639-3/nob', count: '10', active: true },
      { id: 'language_eng', bucket: 'http://lexvo.org/id/iso639-3/eng', count: '40', active: false },
      { id: 'language_fin', bucket: 'http://lexvo.org/id/iso639-3/fin', count: '30', active: false },
      { id: 'language_swe', bucket: 'http://lexvo.org/id/iso639-3/swe', count: '20', active: true }
    ],
    locationQuery: {},
    toggleFilter: () => {},
    toggleFilterVisibility: () => {},
    toggleCollapseFilter: () => {},
    ...propOverrides
  }

  const messages = {
    'http://lexvo.org/id/iso639-3/nob': 'Norwegian',
    'http://lexvo.org/id/iso639-3/eng': 'English',
    'http://lexvo.org/id/iso639-3/fin': 'Finnish',
    'http://lexvo.org/id/iso639-3/swe': 'Swedish'
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <SearchFilter {...props} />
    </IntlProvider>)

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchFilter', () => {
    it('should render empty if no filters', () => {
      const { node } = setup({ filters: undefined })
      expect(node.getAttribute('data-automation-id')).toBe('empty')
    })

    it('should render filters', () => {
      const { node, props } = setup()
      // TODO Uncomment count checks when the count received from elastic search is correct
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[0].id}']`).innerHTML).toContain('Norwegian')
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[1].id}']`).innerHTML).toContain('English')
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[2].id}']`).innerHTML).toContain('Finnish')
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[3].id}']`).innerHTML).toContain('Swedish')
    })

    it('should render checked filters', () => {
      const { node, props } = setup()
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[0].id}']`).getElementsByTagName('input')[ 0 ].checked).toBe(true)
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[1].id}']`).getElementsByTagName('input')[ 0 ].checked).toBe(false)
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[2].id}']`).getElementsByTagName('input')[ 0 ].checked).toBe(false)
      expect(node.querySelector(`[data-automation-id='filter_${props.filters[3].id}']`).getElementsByTagName('input')[ 0 ].checked).toBe(true)
    })

    it('should order by count', () => {
      const { node, props } = setup()
      const nodes = node.querySelectorAll("[data-automation-id^='filter_language_']")
      expect(nodes[ 0 ].getAttribute('data-automation-id')).toBe(`filter_${props.filters[1].id}`)
      expect(nodes[ 1 ].getAttribute('data-automation-id')).toBe(`filter_${props.filters[2].id}`)
      expect(nodes[ 2 ].getAttribute('data-automation-id')).toBe(`filter_${props.filters[3].id}`)
      expect(nodes[ 3 ].getAttribute('data-automation-id')).toBe(`filter_${props.filters[0].id}`)
    })
  })
})
