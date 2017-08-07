/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import styles from './Workspace.css';
import Loading from '../common/Loading';
import WorkspaceList from './WorkspaceList';
import ErrorMessage from '../common/ErrorMessage';
import Span from '../i18n/Span';
import { WORKSPACES_GROUPS } from '../../utils/constants/WorkspaceGroupsConstants';
import LoggerManager from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

export default class WorkspacePage extends Component {

  static propTypes = {
    workspaceList: PropTypes.array,
    userReducer: PropTypes.object.isRequired,
    workspaceReducer: PropTypes.object.isRequired,
    loadWorkspaces: PropTypes.func.isRequired,
    selectWorkspace: PropTypes.func.isRequired
  };

  static drawWorkspaceList(workspaceList, selectWorkspace) {
    LoggerManager.log('drawWorkspaceList');
    if (workspaceList.length > 0) {
      return (<WorkspaceList
        workspaceList={workspaceList}
        workspaceGroup={translate('allWorkspaces')}
        onClickHandler={selectWorkspace} />);
    } else {
      return <br />;
    }
  }

  constructor() {
    LoggerManager.log('constructor');
    super();

    this.state = {
      showWorkspaces: false
    };

    this.selectContentElementToDraw.bind(this);
  }

  componentWillMount() {
    LoggerManager.log('componentWillMount');
    this.props.loadWorkspaces(this.props.userReducer.userData.id);
  }

  componentWillReceiveProps(nextProps) {
    LoggerManager.log('componentWillReceiveProps');
    if (!nextProps.workspaceReducer.workspaceLoading && !this.state.showWorkspaces) {
      this.setState({ showWorkspaces: true });
    }
  }

  selectContentElementToDraw() {
    LoggerManager.log('selectContentElementToDraw');
    if (this.props.workspaceReducer.workspaceLoading !== false || this.state.showWorkspaces === false) {
      return <Loading />;
    }
    if (this.props.workspaceReducer.errorMessage && this.props.workspaceReducer.errorMessage !== '') {
      return <ErrorMessage message={this.props.workspaceReducer.errorMessage} />;
    } else {
      return WorkspacePage.drawWorkspaceList(this.props.workspaceReducer.workspaceList, this.props.selectWorkspace);
    }
  }

  splitWorkspaceByGroups() {
    LoggerManager.log('splitWorkspaceByGroups');
    const workspacesByGroup = [];
    if (this.props.workspaceReducer.workspaceList.length > 0) {
      WORKSPACES_GROUPS.forEach((wgValue) => {
        const wsByGroup = this.props.workspaceReducer.workspaceList.filter((wsValue) => (
          wsValue['workspace-group'] === wgValue.type
        ));
        workspacesByGroup.push(wsByGroup);
      });
      /* collect workspaces with no group into a virtual "Other" group */
      const otherWs = [];
      this.props.workspaceReducer.workspaceList.forEach((ws) => {
        if (!ws['workspace-group']) {
          ws['workspace-group'] = 'Other';
          otherWs.push(ws);
        }
      });
      workspacesByGroup.push(otherWs);
    }
    return workspacesByGroup;
  }

  render() {
    LoggerManager.log('render');
    return (
      <div className={styles.workspaces_container}>
        <h2 className={styles.title}><Span text="workspaceTitle" /></h2>
        <hr />
        {this.selectContentElementToDraw()}
      </div>
    );
  }
}
