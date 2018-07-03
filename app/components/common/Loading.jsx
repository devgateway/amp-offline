import React, { Component } from 'react';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';

const logger = new Logger('Loading component');

export default class Loading extends Component {

  constructor() {
    super();
    logger.log('constructor');
  }

  render() {
    logger.log('render');
    return (
      <div>
        <span>{translate('Loading...')}</span>
      </div>
    );
  }
}
