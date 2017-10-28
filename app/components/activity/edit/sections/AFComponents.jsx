import React, { Component } from 'react';
import AFSection from './AFSection';
import { COMPONENTS } from './AFSectionConstants';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF components');

/**
 * Components Section
 * @author Nadejda Mandrescu
 */
class AFComponents extends Component {

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFComponents, COMPONENTS);
