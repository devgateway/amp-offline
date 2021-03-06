/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { ActivityConstants, FeatureManagerConstants, FeatureManager } from 'amp-ui';
import Logger from '../../../../../../modules/util/LoggerManager';
import AFField from '../../../components/AFField';
import styles from '../AFFunding.css';
import { orgFormatter } from '../../AFOrganizations';

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
    if (FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_FUNDING_SEARCH_ORGANIZATION)) {
      return (<div className={styles.funding_org}>
        <AFField
          parent={this.props.activity} fieldPath={ActivityConstants.DONOR_ORGANIZATION}
          extraParams={{ 'no-table': true, afOptionFormatter: orgFormatter, sortByDisplayValue: true }}
          onAfterUpdate={this._handleDonorSelect.bind(this)} />
      </div>);
    }
    return null;
  }
}
