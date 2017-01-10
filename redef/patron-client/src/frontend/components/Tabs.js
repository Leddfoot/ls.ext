import React, { PropTypes } from 'react'
import { matchPattern } from 'react-router/lib/PatternUtils'

import Tab from './Tab'

class Tabs extends React.Component {
  constructor (props) {
    super(props)
    this.findNextTab = this.findNextTab.bind(this)
    this.findPrevTab = this.findPrevTab.bind(this)
  }

  findNextTab () {
    const tabListLength = this.props.tabList.length
    for (let i = 0; i < tabListLength; i++) {
      if (matchPattern(this.props.tabList[i].path, this.props.currentPath)) {
        if (i < tabListLength - 1) {
          return this.props.tabList[ i + 1 ]
        } else {
          return this.props.tabList[0]
        }
      }
    }
  }

  findPrevTab () {
    const tabListLength = this.props.tabList.length
    for (let i = 0; i < tabListLength; i++) {
      if (matchPattern(this.props.tabList[i].path, this.props.currentPath)) {
        if (i >= 1) {
          return this.props.tabList[ i - 1 ]
        } else {
          return this.props.tabList[tabListLength - 1]
        }
      }
    }
  }

  render () {
    return (
      <div role="menubar">
        <ul className={this.props.tabBarClass} data-automation-id="tabs" role="tablist" aria-label={this.props.label}>
          {this.props.tabList.map(tab => (
            <Tab key={tab.label}
                 tab={tab}
                 id={tab.label}
                 className={matchPattern(tab.path, this.props.currentPath) ? `${this.props.tabClass} ${this.props.tabActiveClass}` : this.props.tabClass}
                 ariaSelected={matchPattern(tab.path, this.props.currentPath) ? 'true' : 'false'}
                 push={this.props.push}
                 findNextTab={this.findNextTab}
                 findPrevTab={this.findPrevTab}
            />
          ))}
        </ul>
      </div>
    )
  }
}

Tabs.propTypes = {
  label: PropTypes.string.isRequired,
  tabList: PropTypes.array.isRequired,
  push: PropTypes.func.isRequired,
  currentPath: PropTypes.string.isRequired,
  tabBarClass: PropTypes.string.isRequired,
  tabClass: PropTypes.string.isRequired,
  tabActiveClass: PropTypes.string.isRequired
}

Tabs.defaultProps = {
  tabBarClass: 'tab-bar',
  tabClass: 'tab-bar-tab',
  tabActiveClass: 'tab-bar-tab-active'
}

export default Tabs

