// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import styles from './Workspace.css'

export default class WorkspacePage extends Component {

  constructor() {
    super();
    console.log('constructor()');

    this.state = {
      workspaceList: [],
      isProcessing: false
    }
  }

  render() {
    return (
      <div className={styles.workspaces_container}>
        <h2>Workspaces</h2>
        <hr/>
        <ul>
          {this.state.workspaceList.map(function (item) {
            return <li>{item}</li>
          })}
        </ul>
      </div>
    );
  }
}
