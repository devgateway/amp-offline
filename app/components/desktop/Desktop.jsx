/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import TopArea from '../desktop/TopArea';
import TabsContainer from './TabsContainer';
import UrlUtils from '../../utils/URLUtils';
import LoggerManager from '../../modules/util/LoggerManager';
import Loading from '../common/Loading';

export default class Desktop extends Component {

  static propTypes = {
    desktopReducer: PropTypes.object.isRequired,
    workspaceReducer: PropTypes.object.isRequired,
    userReducer: PropTypes.object.isRequired,
    loadDesktop: PropTypes.func.isRequired
  };

  componentDidMount() {
    LoggerManager.log('componentDidMount');
    // Check if a workspace has been selected.
    if (!this.props.workspaceReducer.currentWorkspace) {
      UrlUtils.forwardTo('/workspace');
    }
  }

  componentWillUpdate() {
    LoggerManager.log('componentWillUpdateaaa');
    if (!this.props.desktopReducer.loaded && !this.props.desktopReducer.isLoadingDesktop) {
      // Check if we need to load the list of projects.
      this.props.loadDesktop(this.props.workspaceReducer.currentWorkspace, this.props.userReducer.teamMember.id);
    }
  }

  render() {
    LoggerManager.log('render');
    if (!this.props.desktopReducer.loaded || this.props.desktopReducer.isLoadingDesktop) {
      return <Loading />;
    } else {
      return (
        <div>
          <TopArea
            workspaceReducer={this.props.workspaceReducer.currentWorkspace}
            currentWorkspaceSettings={this.props.workspaceReducer.currentWorkspaceSettings}
          />
          <TabsContainer tabsData={this.props.desktopReducer.tabsData} />
        </div>
      );
    }
  }
}
