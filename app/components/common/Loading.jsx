import React, { Component } from 'react';
import Logger from '../../modules/util/LoggerManager';

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
        <span>Loading...</span>
      </div>
    );
  }
}
