import React from 'react';
import AFSection from './AFSection';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Programs Section
 * @author Nadejda Mandrescu
 */
export default class Programs extends AFSection {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  renderContent() {
    return <div>TODO</div>;
  }
}
