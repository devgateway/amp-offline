import React, { Component, PropTypes } from 'react';
import { ActivityConstants, FieldsManager, APPercentageList } from 'amp-ui';
import Section from './Section';
import styles from './APSector.css';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';
import { rawNumberToFormattedString } from '../../../../utils/NumberUtils';

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
        <PrimarySectorList
          key="primary-programs-list" {...this.props} translate={translate} Logger={Logger}
          rawNumberToFormattedString={rawNumberToFormattedString} />
      </div>
      <div className={styles.secondary_sector}>
        <SecondarySectorList
          key="secondary-programs-list" {...this.props} translate={translate} Logger={Logger}
          rawNumberToFormattedString={rawNumberToFormattedString} />
      </div>
    </div>);
  }
}

export default Section(APSector, 'Sectors', true, 'APSector');
