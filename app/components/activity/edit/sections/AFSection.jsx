import React, { Component, PropTypes } from 'react';
import * as styles from '../ActivityForm.css';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import LoggerManager from '../../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * A generic Activity Form section
 * @author Nadejda Mandrescu
 */
export default class AFSection extends Component {
  // TODO reuse section from preview
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired
  };

  static propTypes = {
    name: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (
      <div className={styles.section_group}>
        <div className={styles.section_title}>{this.props.name}</div>
        <div>{this.renderContent()}</div>
      </div>
    );
  }
}
