import React, { Component } from 'react';
import AFSection from './AFSection';
import { PLANNING } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Planning Section
 * @author Nadejda Mandrescu
 */
class AFPlanning extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFPlanning, PLANNING);
