/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import styles from './Workspace.css';
import Loading from '../common/Loading';
import WorkspaceList from './WorkspaceList';
import ErrorMessage from '../common/ErrorMessage';
import Span from '../i18n/Span';
import { WORKSPACES_GROUPS } from '../../utils/constants/WorkspaceGroupsConstants';
import LoggerManager from '../../modules/util/LoggerManager';

export default class WorkspacePage extends Component {

  static propTypes = {
    workspaceList: PropTypes.array,
    user: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired,
    loadWorkspaces: PropTypes.func.isRequired,
    selectWorkspace: PropTypes.func.isRequired
  };

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
    this.props.loadWorkspaces(this.props.user.userData.id);
  }

  componentWillReceiveProps(nextProps) {
    LoggerManager.log('componentWillReceiveProps');
    if (!nextProps.workspace.workspaceLoading && !this.state.showWorkspaces) {
      this.setState({ showWorkspaces: true });
    }
  }

  selectContentElementToDraw() {
    LoggerManager.log('selectContentElementToDraw');
    if (this.props.workspace.workspaceLoading !== false || this.state.showWorkspaces === false) {
      return <Loading />;
    } else {
      if (this.props.workspace.errorMessage && this.props.workspace.errorMessage !== '') {
        return <ErrorMessage message={this.props.workspace.errorMessage} />;
      } else {
        return this.splitWorkspaceByGroups().map((workspaceList) => (
          this.drawWorkspaceList(workspaceList, this.props.selectWorkspace)
        ));
      }
    }
  }

  splitWorkspaceByGroups() {
    LoggerManager.log('splitWorkspaceByGroups');
    const workspacesByGroup = [];
    if (this.props.workspace.workspaceList.length > 0) {
      WORKSPACES_GROUPS.forEach((wgValue) => {
        const wsByGroup = this.props.workspace.workspaceList.filter((wsValue) => (
          wsValue['workspace-group'] === wgValue.type
        ));
        workspacesByGroup.push(wsByGroup);
      });
    }
    return workspacesByGroup;
  }

  drawWorkspaceList(workspaceList, selectWorkspace) {
    LoggerManager.log('drawWorkspaceList');
    if (workspaceList.length > 0) {
      return (<WorkspaceList
        workspaceList={workspaceList}
        workspaceGroup={workspaceList[0]['workspace-group']}
        onClickHandler={selectWorkspace} />);
    } else {
      return <br />;
    }
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
