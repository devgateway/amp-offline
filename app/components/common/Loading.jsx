import React, {Component, PropTypes} from 'react';
import LoggerManager from '../../modules/util/LoggerManager';

export default class Loading extends Component {

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  render() {
    LoggerManager.log('render');
    return (
      <div>
        <span>Loading...</span>
      </div>
    );
  }
}
