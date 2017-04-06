import React, { Component, PropTypes } from 'react';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';

export default class WarnMessage extends Component {

  static propTypes = {
    message: PropTypes.string.isRequired
  };

  render() {
    LoggerManager.log('render');
    return (
      <div className={`alert alert-warning ${(this.props.message === '' ? 'hidden' : '')}`}>
        <strong>{translate('Warning')}: </strong>{this.props.message}
      </div>
    );
  }
}
