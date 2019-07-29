/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../../modules/util/LoggerManager';
import AFField from '../../../components/AFField';
import { DONOR_ORGANIZATION } from '../../../../../../utils/constants/ActivityConstants';
import styles from '../AFFunding.css';
import * as FMC from '../../../../../../utils/constants/FeatureManagerConstants';
import FeatureManager from '../../../../../../modules/util/FeatureManager';

const logger = new Logger('AP Funding Organization select');

/**
 * Funding Section
 * @author Gabriel Inchauspe
 */
export default class AFFundingOrganizationSelect extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired,
    handleDonorSelect: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  _handleDonorSelect(value) {
    logger.debug('_handleDonorSelect');
    this.props.handleDonorSelect(value);
  }

  render() {
    if (FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_FUNDING_SEARCH_ORGANIZATION)) {
      return (<div className={styles.funding_org}>
        <AFField
          parent={this.props.activity} fieldPath={DONOR_ORGANIZATION}
          extraParams={{ 'no-table': true }} onAfterUpdate={this._handleDonorSelect.bind(this)} />
      </div>);
    }
    return null;
  }
}
