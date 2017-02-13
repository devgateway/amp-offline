// @flow
import React, { Component, PropTypes } from 'react';

export default class Tab extends Component {

  static propTypes = {
    tabData: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired,
    isActive: PropTypes.bool.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    return (
      <li onClick={this.props.handleClick} className={this.props.isActive ? 'active' : null}>
        <a>{this.props.tabData.name}</a>
      </li>
    );
  }
}
