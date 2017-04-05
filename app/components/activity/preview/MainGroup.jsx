import React, { PropTypes, Component } from 'react';
import ActivityFieldsManager from '../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import LoggerManager from '../../../modules/util/LoggerManager';

export default class MainGroup extends Component {
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div>
      <span>Main Content...</span>
    </div>);
  }
}
