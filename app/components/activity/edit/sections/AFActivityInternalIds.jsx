import React, { Component } from 'react';
import AFSection from './AFSection';
import { ACTIVITY_INTERNAL_IDS } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Activity Internal IDs section
 * @author Nadejda Mandrescu
 */
class AFActivityInternalIds extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFActivityInternalIds, ACTIVITY_INTERNAL_IDS);
