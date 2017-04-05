import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../modules/util/LoggerManager';

export default class ErrorMessage extends Component {

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  render() {
    LoggerManager.log('render');
    return (
      <div className={'alert alert-danger ' + (this.props.message === '' ? 'hidden' : '')}>
        <strong>Error: </strong> {this.props.message.message}
      </div>
    );
  }
}
