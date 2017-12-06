import React, { Component, PropTypes } from 'react';
import translate from '../../utils/translate';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('error message component');

export default class ErrorMessage extends Component {

  static propTypes = {
    message: PropTypes.string.isRequired
  };

  render() {
    logger.log('render');
    // TODO AMPOFFLINE-192: expect simple string message or format as needed if some error message object is provided
    return (
      <div className={`alert alert-danger ${(this.props.message === '' ? 'hidden' : '')}`}>
        <strong>{translate('Error')}: </strong>{this.props.message.message || this.props.message}
      </div>
    );
  }
}
