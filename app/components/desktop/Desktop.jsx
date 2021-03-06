/* eslint react/jsx-space-before-closing: 0 */
/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import { Loading } from 'amp-ui';
import TopArea from '../desktop/TopArea';
import TabsContainer from './TabsContainer';
import UrlUtils from '../../utils/URLUtils';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

const logger = new Logger('Desktop');

export default class Desktop extends Component {

  static propTypes = {
    desktopReducer: PropTypes.object.isRequired,
    workspaceReducer: PropTypes.object.isRequired,
    userReducer: PropTypes.object.isRequired,
    translationReducer: PropTypes.object.isRequired,
    loadDesktop: PropTypes.func.isRequired

  };

  componentDidMount() {
    logger.debug('componentDidMount');
    // Check if a workspace has been selected.
    if (!this.props.workspaceReducer.currentWorkspace) {
      UrlUtils.forwardTo('/workspace');
    }
  }

  componentWillUpdate() {
    logger.debug('componentWillUpdateaaa');
    if (!this.props.desktopReducer.loaded && !this.props.desktopReducer.isLoadingDesktop) {
      // Check if we need to load the list of projects.
      this.props.loadDesktop(this.props.workspaceReducer.currentWorkspace, this.props.userReducer.teamMember.id);
    }
  }

  render() {
    logger.debug('render');
    if (!this.props.desktopReducer.loaded || this.props.desktopReducer.isLoadingDesktop) {
      return <Loading Logger={Logger} translate={translate} />;
    } else {
      return (
        <div>
          <TopArea
            workspaceReducer={this.props.workspaceReducer.currentWorkspace}
            currentWorkspaceSettings={this.props.workspaceReducer.currentWorkspaceSettings}
            translationReducer={this.props.translationReducer}
          />
          <TabsContainer tabsData={this.props.desktopReducer.tabsData} {...this.props} />
        </div>
      );
    }
  }
}
