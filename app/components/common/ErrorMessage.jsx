import React, { Component, PropTypes } from 'react';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';

export default class ErrorMessage extends Component {

  static propTypes = {
    message: PropTypes.string.isRequired
  };

  render() {
    LoggerManager.log('render');
    return (
      <div className={`alert alert-danger ${(this.props.message === '' ? 'hidden' : '')}`}>
        <strong>{translate('Error')}: </strong>{this.props.message.message}
      </div>
    );
  }
}
