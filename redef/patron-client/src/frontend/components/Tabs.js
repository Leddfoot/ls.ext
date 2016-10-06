import React, { PropTypes } from 'react'
import { matchPattern } from 'react-router/lib/PatternUtils'

import Tab from './Tab'

class Tabs extends React.Component {
  render () {
    return (
      <div role="menubar">
        <ul className={this.props.tabBarClass} data-automation-id="tabs" role="menu" aria-label={this.props.label}>
          {this.props.tabList.map(tab => (
            <Tab key={tab.label}
                 tab={tab}
                 className={matchPattern(tab.path, this.props.currentPath) ? `${this.props.tabClass} ${this.props.tabActiveClass}` : this.props.tabClass}
                 ariaSelected={matchPattern(tab.path, this.props.currentPath) ? 'true' : 'false'}
                 push={this.props.push} />
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

