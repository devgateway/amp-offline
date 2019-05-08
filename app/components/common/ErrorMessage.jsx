import React, { Component } from 'react';
import PropTypes from 'prop-types';
import translate from '../../utils/translate';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('error message component');

export default class ErrorMessage extends Component {

  static propTypes = {
    message: PropTypes.object
  };

  render() {
    logger.log('render');
    const error = this.props.message;
    const actualMessage = error ? (error.message || error) : null;
    if (!actualMessage) {
      return null;
    }
    return (
      <div className="alert alert-danger">
        <strong>{translate('Error')}: </strong>{actualMessage}
      </div>
    );
  }
}
