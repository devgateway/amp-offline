// @flow
import React, { Component, PropTypes } from "react";
import { Link } from "react-router";
import styles from "./Workspace.css";
import Loading from "../common/Loading";
import WorkspaceList from "./WorkspaceList";
import ErrorMessage from "../common/ErrorMessage";
import Span from "../i18n/Span";
import { WORKSPACES_GROUPS } from "../../utils/constants/WorkspaceGroupsConstants";
export default class WorkspacePage extends Component {

  constructor() {
    console.log('constructor');
    super();

    this.state = {
      errorMessage: "",
      isProcessing: false,
      firstLoad: true
    };

    this.selectContentElementToDraw.bind(this);
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.state.firstLoad = false;
  }

  render() {
    console.log('render');
    this.state.isProcessing = this.props.workspace.workspaceLoading;
    this.state.errorMessage = this.props.workspace.errorMessage || '';

    return (
      <div className={styles.workspaces_container}>
        <h2 className={styles.title}><Span text="workspace.title"/></h2>
        <hr/>
        {this.selectContentElementToDraw()}
        <Link to="syncUp" >Sync upd</Link>
      </div>
    );
  }

  selectContentElementToDraw() {
    if (this.state.isProcessing !== false || this.state.firstLoad === true) {
      return <Loading/>;
    } else {
      if (this.state.errorMessage !== '') {
        return <ErrorMessage message={this.state.errorMessage}/>;
      } else {
        return this.splitWorkspaceByGroups().map(this.drawWorkspaceList);
      }
    }
  }

  splitWorkspaceByGroups() {
    let workspacesByGroup = [];
    WORKSPACES_GROUPS.forEach((wgValue) => {
      let wsByGroup = this.props.workspace.workspaceList.filter((wsValue) => {
        return wsValue['workspace-group'] === wgValue.type;
      });
      workspacesByGroup.push(wsByGroup);
    });
    return workspacesByGroup;
  }

  drawWorkspaceList(workspaceList) {
    if (workspaceList.length > 0) {
      return <WorkspaceList workspaceList={workspaceList}
                            workspaceGroup={workspaceList[0]['workspace-group']}/>;
    } else {
      return <br/>
    }
  }
}
