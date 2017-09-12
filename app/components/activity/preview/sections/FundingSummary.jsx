import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APField from '../components/APField';
import * as VC from '../../../../utils/constants/ValueConstants';
import * as PC from '../../../../utils/constants/FieldPathConstants';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import FeatureManager from '../../../../modules/util/FeatureManager';
import NumberUtils from '../../../../utils/NumberUtils';

/* eslint-disable class-methods-use-this */

/**
 * Funding Totals Summary section
 * @author Nadejda Mandrescu
 */
class FundingSummary extends Component {
  static propTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  /**
   * Builds "Funding Information" section by following AMP Activity Preview rules
   * @return {Section}
   * @private
   */
  _buildFundingInformation() {
    const measuresOrder = [
      { trn: VC.ACTUAL_COMMITMENTS, total: true },
      { trn: VC.PLANNED_COMMITMENTS, total: true },
      { trn: VC.ACTUAL_DISBURSEMENTS, total: true },
      { trn: VC.PLANNED_DISBURSEMENTS, total: true },
      { trn: VC.ACTUAL_EXPENDITURES, total: true },
      { trn: VC.UNALLOCATED_DISBURSEMENTS, total: false },
      { trn: VC.PLANNED_EXPENDITURES, total: true },
      { trn: VC.DELIVERY_RATE, total: false }];
    const measuresTotals = {};
    let expendituresAreEnabled = false;
    let actualCommitmentsAreEnabled = false;
    let actualDisbursementsAreEnabled = false;
    // Commitments, Disbursements, Expenditures
    VC.TRANSACTION_TYPES.forEach(trnType => {
      const pv = this.props.activityFieldsManager.possibleValuesMap[PC.TRANSACTION_TYPE_PATH];
      const enabledTrnList = Object.keys(pv).map((i) => (pv[i].value));
      if (enabledTrnList.filter((t) => (t === trnType)).length > 0) {
        // checking if this transaction type is provided as an option, through a trick by detecting the translation
        const trnTypeTrn = this.props.activityFieldsManager.getValueTranslation(PC.TRANSACTION_TYPE_PATH, trnType);
        VC.ADJUSTMENT_TYPES.forEach(adjType => {
          const adjTypeTrn = this.props.activityFieldsManager.getValueTranslation(PC.ADJUSTMENT_TYPE_PATH, adjType);
          if (adjTypeTrn && trnTypeTrn) {
            const value = this.props.activityFundingTotals.getTotals(adjTypeTrn, trnTypeTrn, {});
            measuresTotals[`${adjType} ${trnType}`] = value;
          }
          // Save these 2 flags for "Delivery Rate".
          if (trnType === VC.COMMITMENTS && adjTypeTrn === VC.ACTUAL) {
            actualCommitmentsAreEnabled = true;
          }
          if (trnType === VC.DISBURSEMENTS && adjTypeTrn === VC.ACTUAL) {
            actualDisbursementsAreEnabled = true;
          }
        });
        // Save this flag for "Unallocated Disbursements".
        if (trnType === VC.EXPENDITURES) {
          expendituresAreEnabled = true;
        }
      }
    });
    // Other measures: "Unallocated Disbursements".
    const adjTypeActualTrn = this.props.activityFieldsManager.getValueTranslation(PC.ADJUSTMENT_TYPE_PATH, VC.ACTUAL);
    if (adjTypeActualTrn && expendituresAreEnabled) {
      const ub = VC.UNALLOCATED_DISBURSEMENTS;
      measuresTotals[ub] = this.props.activityFundingTotals.getTotals(ub, {});
    }
    // Other measures: "Delivery rate".
    if (FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_DELIVERY_RATE)) {
      if (actualCommitmentsAreEnabled && actualDisbursementsAreEnabled
        && measuresTotals[`${VC.ACTUAL} ${VC.DISBURSEMENTS}`] !== '0'
        && measuresTotals[`${VC.ACTUAL} ${VC.COMMITMENTS}`] !== '0') {
        let value = NumberUtils.formattedStringToRawNumber(measuresTotals[`${VC.ACTUAL} ${VC.DISBURSEMENTS}`])
          / NumberUtils.formattedStringToRawNumber(measuresTotals[`${VC.ACTUAL} ${VC.COMMITMENTS}`]);
        value *= 100;
        value = NumberUtils.rawNumberToFormattedString(value);
        measuresTotals[VC.DELIVERY_RATE] = value;
      } else {
        measuresTotals[VC.DELIVERY_RATE] = 0;
      }
    }

    return this._buildTotalFields(measuresOrder, measuresTotals);
  }

  _buildTotalFields(measuresOrder, measuresTotals) {
    const fundingInfoSummary = [];
    const totalTrn = translate('Total');
    measuresOrder.forEach(measure => {
      const value = measuresTotals[measure.trn];
      if (value !== undefined) {
        let title = translate(measure.trn);
        if (measure.total) {
          title = `${totalTrn} ${title}`;
        }
        const key = `Summary-Total-${measure.trn}`;
        fundingInfoSummary.push(<APField
          key={key} title={title} value={value} separator={false}
          fieldNameClass={this.props.fieldNameClass} fieldValueClass={this.props.fieldValueClass} />);
      }
    });
    return fundingInfoSummary;
  }

  render() {
    return <div>{this._buildFundingInformation()}</div>;
  }
}

export default Section(FundingSummary, 'fundingInformation');
