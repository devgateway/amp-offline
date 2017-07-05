import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APPercentageList from '../components/APPercentageList';
import {
  PRIMARY_PROGRAMS,
  SECONDARY_PROGRAMS,
  PROGRAM,
  PROGRAM_PERCENTAGE
} from '../../../../utils/constants/ActivityConstants';
import styles from '../ActivityPreview.css';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import LoggerManager from '../../../../modules/util/LoggerManager';

const PrimaryProgramList = APPercentageList(PRIMARY_PROGRAMS, PROGRAM, PROGRAM_PERCENTAGE, 'Primary Program');
const SecondaryProgramList = APPercentageList(SECONDARY_PROGRAMS, PROGRAM, PROGRAM_PERCENTAGE, 'Secondary Program');

/**
 * Activity Preview Program section
 * @author Nadejda Mandrescu
 */
class APProgram extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div>
      <div className={styles.primary_sector}>
        <PrimaryProgramList key="primary-programs-list" {...this.props} />
      </div>
      <div className={styles.secondary_sector}>
        <SecondaryProgramList key="secondary-programs-list" {...this.props} />
      </div>
    </div>);
  }

}

export default Section(APProgram, 'Program', true, 'APProgram');
