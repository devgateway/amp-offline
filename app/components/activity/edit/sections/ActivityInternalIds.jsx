import React from 'react';
import AFSection from './AFSection';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Activity Internal IDs section
 * @author Nadejda Mandrescu
 */
export default class ActivityInternalIds extends AFSection {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  renderContent() {
    return <div>TODO</div>;
  }
}
