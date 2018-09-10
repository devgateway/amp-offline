/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import styles from './AFFundingDetailItem.css';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import translate from '../../../../../utils/translate';
import FeatureManager from '../../../../../modules/util/FeatureManager';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailItem extends Component {

  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  static propTypes = {
    fundingDetail: PropTypes.object.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
    funding: PropTypes.object.isRequired,
    type: PropTypes.string
  };

  static orgTypeNameToCollection(typeName) {
    let collection = '';
    switch (typeName) {
      case VC.IMPLEMENTING_AGENCY:
        collection = AC.IMPLEMENTING_AGENCY;
        break;
      case VC.RESPONSIBLE_ORGANIZATION:
        collection = AC.RESPONSIBLE_ORGANIZATION;
        break;
      case VC.REGIONAL_GROUP:
        collection = AC.REGIONAL_GROUP;
        break;
      case VC.EXECUTING_AGENCY:
        collection = AC.EXECUTING_AGENCY;
        break;
      case VC.DONOR_ORGANIZATION:
        collection = AC.DONOR_ORGANIZATION;
        break;
      case VC.BENEFICIARY_AGENCY:
        collection = AC.BENEFICIARY_AGENCY;
        break;
      case VC.CONTRACTING_AGENCY:
        collection = AC.CONTRACTING_AGENCY;
        break;
      default:
        break;
    }
    return collection;
  }

  constructor(props) {
    super(props);
    this.state = { selectedOrgRole: undefined };
  }

  _getRecipientRoleFilter(typeName) {
    const activity = this.context.activity;
    const filter = [];
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
      const collection = AFFundingDetailItem.orgTypeNameToCollection(o.value);
      if (FeatureManager.isFMSettingEnabled(FMC[o.id]) && activity[collection] && activity[collection].length > 0) {
        filter.push({ path: 'value', value: o.value });
      }
    });
    return filter;
  }

  _getRecipientOrgFilter() {
    const filter = [];
    if (this.state.selectedOrgRole) {
      const collection = AFFundingDetailItem.orgTypeNameToCollection(this.state.selectedOrgRole.value);
      const role = this.context.activity[collection];
      if (role) {
        role.forEach(r => {
          filter.push({ path: 'value', value: r.organization.value });
        });
      } else {
        filter.push([{ path: 'value', value: 'fake' }]);
      }
    } else {
      filter.push([{ path: 'value', value: 'fake' }]);
    }
    return filter;
  }

  handleSelectRecipientRole(fundingDetail, role) {
    if (role) {
      this.setState({ selectedOrgRole: role });
    } else {
      this.setState({ selectedOrgRole: undefined });
    }
  }

  generateRecipients(typeName, fundingDetail) {
    const content = [];
    content.push(<AFField
      parent={fundingDetail} className={styles.cell_2}
      fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.RECIPIENT_ROLE}`}
      fmPath={FMC[`ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_RECIPIENT_ORGROLE`]}
      filter={this._getRecipientRoleFilter(typeName)} extraParams={{ isORFilter: true }}
      onAfterUpdate={this.handleSelectRecipientRole.bind(this, fundingDetail)} />);
    content.push(<AFField
      parent={fundingDetail} className={styles.cell_2}
      fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.RECIPIENT_ORGANIZATION}`}
      fmPath={FMC[`ACTIVITY_${typeName}_FUNDING_FLOWS_ORGROLE_RECIPIENT_ORGANIZATION`]}
      filter={this._getRecipientOrgFilter(typeName)} extraParams={{ isORFilter: true }} />);
    return content;
  }

  render() {
    const { type, fundingDetail, funding, removeFundingDetailItem } = this.props;
    // When adding a new item we select the default currency like in AMP.
    if (!fundingDetail[AC.CURRENCY].id) {
      const currency = Object.values(this.context.activityFieldsManager.possibleValuesMap[FPC.FUNDING_CURRENCY_PATH])
        .filter(pv => pv.value === this.context.currentWorkspaceSettings.currency.code);
      fundingDetail[AC.CURRENCY] = currency[0];
    }
    const orgGroupName = funding[AC.FUNDING_DONOR_ORG_ID][AC.EXTRA_INFO][AC.ORGANIZATION_GROUP];
    let fixedExchangeRateFMPath;
    let pledgeFMPath;
    let disasterResponseFMPath;
    let typeName = '';
    switch (type) {
      case VC.COMMITMENTS:
        fixedExchangeRateFMPath = FMC.ACTIVITY_COMMITMENTS_FIXED_EXCHANGE_RATE;
        pledgeFMPath = FMC.ACTIVITY_COMMITMENTS_PLEDGES;
        disasterResponseFMPath = FMC.ACTIVITY_COMMITMENTS_DISASTER_RESPONSE;
        typeName = 'COMMITMENTS';
        break;
      case VC.DISBURSEMENTS:
        fixedExchangeRateFMPath = FMC.ACTIVITY_DISBURSEMENTS_FIXED_EXCHANGE_RATE;
        pledgeFMPath = FMC.ACTIVITY_DISBURSEMENTS_PLEDGES;
        disasterResponseFMPath = FMC.ACTIVITY_DISBURSEMENTS_DISASTER_RESPONSE;
        typeName = 'DISBURSEMENTS';
        break;
      case VC.EXPENDITURES:
        fixedExchangeRateFMPath = FMC.ACTIVITY_EXPENDITURES_FIXED_EXCHANGE_RATE;
        pledgeFMPath = FMC.ACTIVITY_EXPENDITURES_PLEDGES;
        disasterResponseFMPath = FMC.ACTIVITY_EXPENDITURES_DISASTER_RESPONSE;
        typeName = 'EXPENDITURES';
        break;
      default:
        break;
    }
    return (<div className={styles.full_width}>
      <table>
        <tbody>
          <tr>
            <td>
              <div className={styles.row}>
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.ADJUSTMENT_TYPE}`} />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_AMOUNT}`} />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.CURRENCY}`} defaultValueAsEmptyObject />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.TRANSACTION_DATE}`} />
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  type={Types.RADIO_BOOLEAN} fmPath={disasterResponseFMPath}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.DISASTER_RESPONSE}`} />
                {(fundingDetail[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS) ? <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fmPath={FMC.ACTIVITY_DISBURSEMENTS_DISBURSEMENT_ORDER_ID}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.DISBURSEMENT_ORDER_ID}`} /> : null}
                <AFField
                  parent={fundingDetail} className={styles.cell_3}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.PLEDGE}`}
                  filter={[{ value: orgGroupName, path: `${AC.EXTRA_INFO}~${AC.ORGANIZATION_GROUP}` }]}
                  fmPath={pledgeFMPath} />
                <AFField
                  parent={fundingDetail} className={styles.cell_4}
                  fieldPath={`${AC.FUNDINGS}~${AC.FUNDING_DETAILS}~${AC.FIXED_EXCHANGE_RATE}`}
                  fmPath={fixedExchangeRateFMPath}
                  extraParams={{ bigger: 0 }} />
                {this.generateRecipients(typeName, fundingDetail)}
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
