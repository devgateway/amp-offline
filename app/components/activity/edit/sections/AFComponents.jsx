import React, { Component } from 'react';
import AFSection from './AFSection';
import { COMPONENTS } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Components Section
 * @author Nadejda Mandrescu
 */
class AFComponents extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFComponents, COMPONENTS);
