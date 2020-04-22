import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../../../modules/util/LoggerManager';
import { FieldsManager } from 'amp-ui';
import AFSection from './AFSection';
import { REGIONAL_FUNDING } from './AFSectionConstants';

const logger = new Logger('AF regional funding');

class AFRegionalFunding extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  render() {
    return <div>regional funding</div>;
  }
}

export default AFSection(AFRegionalFunding, REGIONAL_FUNDING);
