/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import TopArea from '../desktop/TopArea';
import TabsContainer from './TabsContainer';
import LoggerManager from '../../modules/util/LoggerManager';

export default class Desktop extends Component {

  static propTypes = {
    desktop: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  componentDidMount() {
    LoggerManager.log('componentDidMount');
  }

  render() {
    LoggerManager.log('render');
    return (
      <div>
        <TopArea workspace={this.props.workspace.currentWorkspace}/>
        <TabsContainer tabsData={this.props.desktop.tabsData}/>
      </div>
    );
  }
}
