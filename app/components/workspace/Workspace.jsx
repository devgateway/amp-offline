/* eslint react/forbid-prop-types: 0 */
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import styles from './Workspace.css';
import Loading from '../common/Loading';
import WorkspaceList from './WorkspaceList';
import ErrorMessage from '../common/ErrorMessage';
import Span from '../i18n/Span';
import { WORKSPACES_GROUPS } from '../../utils/constants/WorkspaceGroupsConstants';

export default class WorkspacePage extends Component {

  static propTypes = {
    workspaceList: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired,
    loadWorkspaces: PropTypes.func.isRequired,
    selectWorkspace: PropTypes.func.isRequired
  };

  constructor() {
    console.log('constructor');
    super();

    this.state = {
      errorMessage: '',
      isProcessing: false,
      firstLoad: true
    };

    this.selectContentElementToDraw.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.state.firstLoad = false;
    this.props.loadWorkspaces(this.props.user.userData.id);
  }

  selectContentElementToDraw() {
    if (this.state.isProcessing !== false || this.state.firstLoad === true) {
      return <Loading/>;
    } else {
      if (this.state.errorMessage !== '') {
        return <ErrorMessage message={this.state.errorMessage}/>;
      } else {
        return this.splitWorkspaceByGroups().map((workspaceList) => (
          this.drawWorkspaceList(workspaceList, this.props.selectWorkspace)
        ));
      }
    }
  }

  splitWorkspaceByGroups() {
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
    if (workspaceList.length > 0) {
      return (<WorkspaceList
        workspaceList={workspaceList}
        workspaceGroup={workspaceList[0]['workspace-group']}
        onClickHandler={selectWorkspace}/>);
    } else {
      return <br/>
    }
  }

  render() {
    console.log('render');
    this.state.isProcessing = this.props.workspace.workspaceLoading;
    this.state.errorMessage = this.props.workspace.errorMessage || '';

    return (
      <div className={styles.workspaces_container}>
        <h2 className={styles.title}><Span text="workspaceTitle"/></h2>
        <hr/>
        {this.selectContentElementToDraw()}
        <Link to="syncUp">Sync upd</Link>
      </div>
    );
  }
}
