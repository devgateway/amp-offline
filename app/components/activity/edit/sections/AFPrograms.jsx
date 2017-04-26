import React, { Component } from 'react';
import AFSection from './AFSection';
import { PROGRAM } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Programs Section
 * @author Nadejda Mandrescu
 */
class AFPrograms extends Component {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFPrograms, PROGRAM);
