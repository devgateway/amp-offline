import React, { Component } from 'react';
import AFSection from './AFSection';
import { LOCATION } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Location Section
 * @author Nadejda Mandrescu
 */
class AFLocation extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFLocation, LOCATION);
