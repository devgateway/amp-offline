// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import styles from './Workspace.css';
import Loading from '../common/Loading';
import WorkspaceList from './WorkspaceList';
import ErrorMessage from '../common/ErrorMessage';

export default class WorkspacePage extends Component {

  constructor() {
    console.log('constructor()');
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
    //TODO: Find a way to move this code outside the React component, it could be done in WorkspacePage but I still dont know how to do it.
    this.props.getRemoteWorkspaces(this.props.login.loggedUser.token);
  }

  render() {
    console.log('render');
    this.state.isProcessing = this.props.workspace.workspaceProcessing;
    this.state.errorMessage = this.props.workspace.errorMessage || '';

    return (
      <div className={styles.workspaces_container}>
        <h2>Workspaces</h2>
        <hr/>
        {this.selectContentElementToDraw()}
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
        return <WorkspaceList workspaceList={this.props.workspace.workspaceList}/>;
      }
    }
  }
}
