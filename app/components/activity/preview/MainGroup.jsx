import React, { Component } from 'react';
import styles from './ActivityPreview.css';
import APIdentification from './sections/APIdentification';
import { APInternalIds } from './sections/APInternalIds';
import APPlanning from './sections/APPlanning';
import LoggerManager from '../../../modules/util/LoggerManager';

/**
 * Main content
 * @author Nadejda Mandrescu
 */
export default class MainGroup extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    // TODO (iteration 2+) hide planning section if it is disabled
    return (<div className={styles.section_group}>
      <APIdentification />
      <APInternalIds />
      <APPlanning />
    </div>);
  }
}
