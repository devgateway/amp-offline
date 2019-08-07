import React, { Component, PropTypes } from 'react';
import { ActivityConstants } from 'amp-ui';
import Section from './Section';
import APPercentageList from '../components/APPercentageList';
import styles from './APSector.css';
import FieldsManager from '../../../../modules/field/FieldsManager';
import Logger from '../../../../modules/util/LoggerManager';

const PrimarySectorList = APPercentageList(ActivityConstants.PRIMARY_SECTORS, ActivityConstants.SECTOR,
  ActivityConstants.SECTOR_PERCENTAGE, 'Primary Sector');
const SecondarySectorList = APPercentageList(ActivityConstants.SECONDARY_SECTORS, ActivityConstants.SECTOR,
  ActivityConstants.SECTOR_PERCENTAGE, 'Secondary Sector');

const logger = new Logger('AP sector');

/**
 * Activity Preview Sector section
 * @author Nadejda Mandrescu
 */
class APSector extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    logger.log('constructor');
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
