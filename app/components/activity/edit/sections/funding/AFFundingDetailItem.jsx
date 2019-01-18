/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as AC from '../../../../../utils/constants/ActivityConstants';
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
  [VC.IMPLEMENTING_AGENCY]: AC.IMPLEMENTING_AGENCY,
  [VC.RESPONSIBLE_ORGANIZATION]: AC.RESPONSIBLE_ORGANIZATION,
  [VC.REGIONAL_GROUP]: AC.REGIONAL_GROUP,
  [VC.EXECUTING_AGENCY]: AC.EXECUTING_AGENCY,
  [VC.DONOR_ORGANIZATION]: AC.DONOR_ORGANIZATION,
  [VC.BENEFICIARY_AGENCY]: AC.BENEFICIARY_AGENCY,
  [VC.CONTRACTING_AGENCY]: AC.CONTRACTING_AGENCY,
  [VC.SECTOR_GROUP]: AC.SECTOR_GROUP
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
    updateParentErrors: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = { selectedOrgRole: props.fundingDetail[AC.RECIPIENT_ROLE] || undefined };
    this._onUpdateField = this._onUpdateField.bind(this);
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
      fieldPath={`${AC.FUNDINGS}~${this.props.trnType}~${AC.RECIPIENT_ROLE}`}
      filter={this._getRecipientRoleFilter()} extraParams={{ isORFilter: true }}
      onAfterUpdate={this.handleSelectRecipientRole.bind(this)} />);
    content.push(<AFField
      parent={fundingDetail} className={styles.cell_2} key={Math.random()}
      fieldPath={`${AC.FUNDINGS}~${this.props.trnType}~${AC.RECIPIENT_ORGANIZATION}`}
      filter={this._getRecipientOrgFilter()} extraParams={{ isORFilter: true }} />);
    return content;
  }

  _onUpdateField() {
    this.props.updateParentErrors();
  }

  render() {
    const { trnType, fundingDetail, funding, removeFundingDetailItem } = this.props;
    const { activityFieldsManager, currentWorkspaceSettings, currencyRatesManager } = this.context;
    // When adding a new item we select the default currency like in AMP.
    if (!fundingDetail[AC.CURRENCY].id) {
      const currencyPath = `${AC.FUNDINGS}~${trnType}~${AC.CURRENCY}`;
      const currencies = activityFieldsManager.getPossibleValuesOptions(currencyPath);
      const wsCurrencyCode = currentWorkspaceSettings.currency.code;
      const currency = AFUtils.getDefaultOrFirstUsableCurrency(currencies, wsCurrencyCode, currencyRatesManager);
      fundingDetail[AC.CURRENCY] = currency;
    }
    const orgGroupName = funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ORGANIZATION_GROUP];
    return (<div className={styles.full_width}>
      <table>
        <tbody>
          <tr>
            <td>
              <div className={styles.row}>
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.ADJUSTMENT_TYPE}`}
                  onAfterUpdate={this._onUpdateField} />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.TRANSACTION_AMOUNT}`}
                  onAfterUpdate={this._onUpdateField} />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.CURRENCY}`} defaultValueAsEmptyObject
                  extraParams={{ noChooseOneOption: true, showOrigValue: true }} onAfterUpdate={this._onUpdateField} />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.TRANSACTION_DATE}`}
                  onAfterUpdate={this._onUpdateField} />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  type={Types.RADIO_BOOLEAN}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.DISASTER_RESPONSE}`}
                  onAfterUpdate={this._onUpdateField} />
                {(trnType === AC.DISBURSEMENTS) ? <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.DISBURSEMENT_ORDER_ID}`}
                  onAfterUpdate={this._onUpdateField} /> : null}
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.PLEDGE}`}
                  filter={[{ value: orgGroupName, path: `${AC.EXTRA_INFO}~${AC.ORGANIZATION_GROUP}` }]}
                  onAfterUpdate={this._onUpdateField} />
                <AFField
                  parent={fundingDetail} className={styles.cell_4}
                  fieldPath={`${AC.FUNDINGS}~${trnType}~${AC.FIXED_EXCHANGE_RATE}`}
                  extraParams={{ bigger: 0 }} onAfterUpdate={this._onUpdateField} />
                {this.generateRecipients(fundingDetail)}
              </div>
            </td>
            <td className={styles.delete_col}>
              <div className={styles.grid}>
                <div className={styles.cell_10}>
                  <a
                    onClick={removeFundingDetailItem.bind(this, fundingDetail[AC.TEMPORAL_ID])}
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
