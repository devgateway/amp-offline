import React, { Component, PropTypes } from 'react';
import style from './Tabs.css';
import Tab from './Tab';
import TabContent from './TabContent';

export default class TabsContainer extends Component {

  static propTypes = {
    tabsData: PropTypes.array.isRequired,
    paginationOptions: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
    this.state = { activeTab: 0 };
  }

  handleClick(tab) {
    this.setState({ activeTab: tab.id });
  }

  render() {
    console.log('render');
    return (
      <div className={style.container}>
        <ul className="nav nav-tabs">
          {this.props.tabsData.map((tab) => {
            return <Tab tabData={tab} isActive={tab.id === this.state.activeTab}
                        handleClick={this.handleClick.bind(this, tab)}/>
          })}
        </ul>
        <TabContent activeTab={this.state.activeTab} data={this.props.tabsData}
                    paginationOptions={this.props.paginationOptions}/>
      </div >
    );
  }
}
