import React, { Component } from 'react';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Funding Section
 * @author Nadejda Mandrescu
 */
class AFFunding extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFFunding, FUNDING);
