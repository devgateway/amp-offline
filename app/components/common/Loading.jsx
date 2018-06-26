import React, { Component } from 'react';
import Logger from '../../modules/util/LoggerManager';
import styles from './Loading.css';
import appStyle from '../layout/App.css';

const logger = new Logger('Loading component');

export default class Loading extends Component {

  constructor() {
    super();
    logger.log('constructor');
  }

  render() {
    logger.log('render');
    return (
      <div className={styles.loading}>
        <span>Loading...</span>
        <img className={appStyle.loading_icon} alt="loading" />
      </div>
    );
  }
}
