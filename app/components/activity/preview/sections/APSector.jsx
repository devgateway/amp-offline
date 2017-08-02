import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APPercentageList from '../components/APPercentageList';
import {
  PRIMARY_SECTORS,
  SECONDARY_SECTORS,
  SECTOR,
  SECTOR_PERCENTAGE
} from '../../../../utils/constants/ActivityConstants';
import styles from './APSector.css';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import LoggerManager from '../../../../modules/util/LoggerManager';

const PrimarySectorList = APPercentageList(PRIMARY_SECTORS, SECTOR, SECTOR_PERCENTAGE, 'Primary Sector');
const SecondarySectorList = APPercentageList(SECONDARY_SECTORS, SECTOR, SECTOR_PERCENTAGE, 'Secondary Sector');

/**
 * Activity Preview Sector section
 * @author Nadejda Mandrescu
 */
class APSector extends Component {
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
    return (<div className={styles.sector_container}>
      <div className={styles.primary_sector}>
        <PrimarySectorList key="primary-programs-list" {...this.props} />
      </div>
      <div className={styles.secondary_sector}>
        <SecondarySectorList key="secondary-programs-list" {...this.props} />
      </div>
    </div>);
  }
}

export default Section(APSector, 'Sectors', true, 'APSector');
