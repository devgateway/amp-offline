/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import TopArea from '../desktop/TopArea';
import TabsContainer from './TabsContainer';
import UrlUtils from '../../utils/URLUtils';
import LoggerManager from '../../modules/util/LoggerManager';

export default class Desktop extends Component {

  static propTypes = {
    desktopReducer: PropTypes.object.isRequired,
    workspaceReducer: PropTypes.object.isRequired
  };

  componentDidMount() {
    LoggerManager.log('componentDidMount');
    if (!this.props.workspaceReducer.currentWorkspace) {
      UrlUtils.forwardTo('/workspace');
    }
  }

  render() {
    LoggerManager.log('render');
    return (
      <div>
        <TopArea workspaceReducer={this.props.workspaceReducer.currentWorkspace} />
        <TabsContainer tabsData={this.props.desktopReducer.tabsData} />
      </div>
    );
  }
}
