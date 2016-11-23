// @flow
import React, {Component, PropTypes} from 'react';

export default class ErrorMessage extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div className={'alert alert-danger ' + (this.props.message === '' ? 'hidden' : '')}>
        <strong>Error: </strong> {this.props.message}
      </div>
    );
  }
}
