// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import styles from './Workspace.css'

export default class WorkspacePage extends Component {

  static propTypes = {
    workspaceList: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor()');
  }

  render() {
    return (
      <div className={styles.workspaces_container}>
        <h2>Workspaces</h2>
        <hr/>
        <ul>
          {['asdfasdf', 'tergfgdf', 'djfsdjs fajsdjf afsdk', '232j 23 123j2 k31j2', 'asdfasd'].map(function (item) {
            return <li>{item}</li>
          })}
        </ul>
      </div>
    );
  }
}
