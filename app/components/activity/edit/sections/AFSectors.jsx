import React, { Component } from 'react';
import AFSection from './AFSection';
import { SECTORS } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Sectors Section
 * @author Nadejda Mandrescu
 */
class AFSectors extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFSectors, SECTORS);
