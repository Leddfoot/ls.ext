/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Tab, { __RewireAPI__ as DefaultExportTabRewireApi } from '../../src/frontend/components/Tab'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    tab: { label: 'test_label', path: 'test_path' },
    push: expect.createSpy(),
    className: '',
    ariaSelected: 'false',
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
      <Tab {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  before(() => {
    DefaultExportTabRewireApi.__Rewire__('Tab', () => <div />)
  })

  after(() => {
    DefaultExportTabRewireApi.__ResetDependency__
  })

  describe('Tab', () => {
    it('should render label on tab', () => {
      const { node, props } = setup()
      expect(node.textContent).toEqual(props.tab.label)
    })

    it('should push path when clicked', () => {
      const { output, props } = setup()
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(output, 'li'))
      expect(props.push).toHaveBeenCalled()
      expect(props.push.calls[ 0 ].arguments[ 0 ]).toEqual({ pathname: props.tab.path })
    })
  })
})
