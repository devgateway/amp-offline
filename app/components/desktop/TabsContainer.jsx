/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import style from './TabsContainer.css';
import Tab from './Tab';
import TabContent from './TabContent';
import LoggerManager from '../../modules/util/LoggerManager';

export default class TabsContainer extends Component {

  static propTypes = {
    tabsData: PropTypes.array.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
    this.state = { activeTab: 0 };
  }

  handleClick(tab) {
    this.setState({ activeTab: tab.id });
  }

  render() {
    LoggerManager.log('render');
    return (
      <div className={style.container}>
        <ul className="nav nav-tabs">
          {this.props.tabsData.map((tab) => (
            <Tab
              tabData={tab}
              isActive={tab.id === this.state.activeTab}
              handleClick={this.handleClick.bind(this, tab)}
            />
          ))}
        </ul>
        <TabContent
          activeTab={this.state.activeTab}
          data={this.props.tabsData}
        />
      </div >
    );
  }
}
