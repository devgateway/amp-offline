import React, { Component } from 'react';
import AFSection from './AFSection';
import { ORGANIZATIONS } from './AFSectionConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Organizations Section
 * @author Nadejda Mandrescu
 */
class AFOrganizations extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return <div>TODO</div>;
  }
}

export default AFSection(AFOrganizations, ORGANIZATIONS);
