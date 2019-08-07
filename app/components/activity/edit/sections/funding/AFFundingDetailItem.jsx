/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable max-len */
/* eslint-disable react/jsx-indent */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants } from 'amp-ui';
import * as VC from '../../../../../utils/constants/ValueConstants';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import styles from './AFFundingDetailItem.css';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import translate from '../../../../../utils/translate';
import FeatureManager from '../../../../../modules/util/FeatureManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AFUtils from '../../util/AFUtils';

const ORG_TYPE_NAME_2_COLLECTION = {
  [VC.IMPLEMENTING_AGENCY]: ActivityConstants.IMPLEMENTING_AGENCY,
  [VC.RESPONSIBLE_ORGANIZATION]: ActivityConstants.RESPONSIBLE_ORGANIZATION,
  [VC.REGIONAL_GROUP]: ActivityConstants.REGIONAL_GROUP,
  [VC.EXECUTING_AGENCY]: ActivityConstants.EXECUTING_AGENCY,
  [VC.DONOR_ORGANIZATION]: ActivityConstants.DONOR_ORGANIZATION,
  [VC.BENEFICIARY_AGENCY]: ActivityConstants.BENEFICIARY_AGENCY,
  [VC.CONTRACTING_AGENCY]: ActivityConstants.CONTRACTING_AGENCY,
  [VC.SECTOR_GROUP]: ActivityConstants.SECTOR_GROUP
};

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailItem extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    currentWorkspaceSettings: PropTypes.object.isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager).isRequired,
  };

  static propTypes = {
    fundingDetail: PropTypes.object.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
    funding: PropTypes.object.isRequired,
    trnType: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = { selectedOrgRole: props.fundingDetail[ActivityConstants.RECIPIENT_ROLE] || undefined };
  }

  _getRecipientRoleFilter() {
    const activity = this.context.activity;
    const filter = [];
    const typeName = this.props.trnType.toUpperCase();
    const options = [{
      value: VC.CONTRACTING_AGENCY,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_CONTRACTING_AGENCY`
    }, {
      value: VC.BENEFICIARY_AGENCY,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_BENEFICIARY_AGENCY`
    }, {
      value: VC.DONOR_ORGANIZATION,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_DONOR_ORGANIZATION`
    }, {
      value: VC.EXECUTING_AGENCY,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_EXECUTING_AGENCY`
    }, {
      value: VC.REGIONAL_GROUP,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_REGIONAL_GROUP`
    }, {
      value: VC.RESPONSIBLE_ORGANIZATION,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_RESPONSIBLE_ORGANIZATION`
    }, {
      value: VC.SECTOR_GROUP,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_SECTOR_GROUP`
    }, {
      value: VC.IMPLEMENTING_AGENCY,
      id: `ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_ADD_IMPLEMENTING_AGENCY`
    }];
    options.forEach(o => {
      const collection = ORG_TYPE_NAME_2_COLLECTION[o.value];
      if (FeatureManager.isFMSettingEnabled(FMC[o.id]) && activity[collection] && activity[collection].length > 0) {
        filter.push({ path: 'value', value: o.value });
      }
    });
    return filter;
  }

  _getRecipientOrgFilter() {
    const filter = [];
    if (this.state.selectedOrgRole) {
      const collection = ORG_TYPE_NAME_2_COLLECTION[this.state.selectedOrgRole.value];
      const role = this.context.activity[collection];
      if (role) {
        role.forEach(r => {
          filter.push({ path: 'value', value: r.organization.value });
        });
      }
    }
    return filter;
  }

  handleSelectRecipientRole(role) {
    if (role) {
      this.setState({ selectedOrgRole: role });
    } else {
      this.setState({ selectedOrgRole: undefined });
    }
  }

  generateRecipients(fundingDetail) {
    const content = [];
    content.push(<AFField
      parent={fundingDetail} className={styles.cell_2} key={Math.random()}
      fieldPath={`${ActivityConstants.FUNDINGS}~${this.props.trnType}~${ActivityConstants.RECIPIENT_ROLE}`}
      filter={this._getRecipientRoleFilter()} extraParams={{ isORFilter: true }}
      onAfterUpdate={this.handleSelectRecipientRole.bind(this)} />);
    content.push(<AFField
      parent={fundingDetail} className={styles.cell_2} key={Math.random()}
      fieldPath={`${ActivityConstants.FUNDINGS}~${this.props.trnType}~${ActivityConstants.RECIPIENT_ORGANIZATION}`}
      filter={this._getRecipientOrgFilter()} extraParams={{ isORFilter: true }} />);
    return content;
  }

  render() {
    const { trnType, fundingDetail, funding, removeFundingDetailItem } = this.props;
    const { activityFieldsManager, currentWorkspaceSettings, currencyRatesManager } = this.context;
    // When adding a new item we select the default currency like in AMP.
    if (!fundingDetail[ActivityConstants.CURRENCY].id) {
      const currencyPath = `${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.CURRENCY}`;
      const currencies = activityFieldsManager.getPossibleValuesOptions(currencyPath);
      const wsCurrencyCode = currentWorkspaceSettings.currency.code;
      const currency = AFUtils.getDefaultOrFirstUsableCurrency(currencies, wsCurrencyCode, currencyRatesManager);
      fundingDetail[ActivityConstants.CURRENCY] = currency;
    }
    const orgGroupName = funding[ActivityConstants.FUNDING_DONOR_ORG_ID][ActivityConstants.EXTRA_INFO][ActivityConstants.ORGANIZATION_GROUP];
    return (<div className={styles.full_width}>
      <table>
        <tbody>
        <tr>
          <td>
            <div className={styles.row}>
              <AFField
                parent={fundingDetail} className={styles.cell_3}
                fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.ADJUSTMENT_TYPE}`} />
              <AFField
                parent={fundingDetail} className={styles.cell_3}
                fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.TRANSACTION_AMOUNT}`} />
              <AFField
                parent={fundingDetail} className={styles.cell_3}
                fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.CURRENCY}`}
                defaultValueAsEmptyObject
                extraParams={{ noChooseOneOption: true, showOrigValue: true }} />
              <AFField
                parent={fundingDetail} className={styles.cell_3}
                fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.TRANSACTION_DATE}`} />
              <AFField
                parent={fundingDetail} className={styles.cell_3}
                type={Types.RADIO_BOOLEAN}
                fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.DISASTER_RESPONSE}`} />
              {(trnType === ActivityConstants.DISBURSEMENTS) ?
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.DISBURSEMENT_ORDER_ID}`} />
                : null}
              <AFField
                parent={fundingDetail} className={styles.cell_3}
                fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.PLEDGE}`}
                filter={[{
                  value: orgGroupName,
                  path: `${ActivityConstants.EXTRA_INFO}~${ActivityConstants.ORGANIZATION_GROUP}`
                }]} />
              <AFField
                parent={fundingDetail} className={styles.cell_4}
                fieldPath={`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.FIXED_EXCHANGE_RATE}`}
                extraParams={{ bigger: 0 }} />
              {this.generateRecipients(fundingDetail)}
            </div>
          </td>
          <td className={styles.delete_col}>
            <div className={styles.grid}>
              <div className={styles.cell_10}>
                <a
                  onClick={removeFundingDetailItem.bind(this, fundingDetail[ActivityConstants.TEMPORAL_ID])}
                  className={styles.delete} href={null} title={translate('Delete')}>&nbsp;</a>
              </div>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>);
  }
}
