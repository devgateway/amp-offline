// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

export default class WorkspaceList extends Component {

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    return (
      <ul>
        {this.props.workspaceList.map(function (item) {
          return <li>{item.id} - {item.name}</li>
        })}
      </ul>
    );
  }
}
