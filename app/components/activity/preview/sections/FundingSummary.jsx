import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FeatureManagerConstants, FeatureManager } from 'amp-ui';
import Section from './Section';
import APField from '../components/APField';
import * as VC from '../../../../utils/constants/ValueConstants';
import * as FPC from '../../../../utils/constants/FieldPathConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('Funding summary');

/* eslint-disable class-methods-use-this */

/**
 * Funding Totals Summary section
 * @author Nadejda Mandrescu
 */
class FundingSummary extends Component {
  static propTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  /**
   * Builds "Funding Information" section by following AMP Activity Preview rules
   * @return {Section}
   * @private
   */
  _buildFundingInformation() {
    const measuresTotals = {};
    const { activityFieldsManager } = this.props;
    let acEnabled = false;
    let adEnabled = false;
    // Commitments, Disbursements, Expenditures
    FPC.TRANSACTION_TYPES.forEach(trnType => {
      if (activityFieldsManager.isFieldPathByPartsEnabled(ActivityConstants.FUNDINGS, trnType)) {
        const trnAdjOptPath = `${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.ADJUSTMENT_TYPE}`;
        const atOptions = activityFieldsManager.getPossibleValuesOptions(trnAdjOptPath);
        acEnabled = acEnabled ||
          (trnType === ActivityConstants.COMMITMENTS && !!atOptions.find(o => o.value === VC.ACTUAL));
        adEnabled = adEnabled ||
          (trnType === ActivityConstants.DISBURSEMENTS && !!atOptions.find(o => o.value === VC.ACTUAL));
        // Actual, Planned
        atOptions.forEach(adjType => {
          const value = this.props.activityFundingTotals.getTotals(adjType.id, trnType, {});
          measuresTotals[`${adjType.value} ${trnType}`] = value;
        });
      }
    });
    // Other measures: "Unallocated Disbursements".
    const adjTypeActualTrn = this.props.activityFieldsManager.getValue(FPC.DISBURSEMENTS_PATH, VC.ACTUAL);
    const expendituresAreEnabled = activityFieldsManager.isFieldPathByPartsEnabled(ActivityConstants.FUNDINGS,
      ActivityConstants.EXPENDITURES);
    if (adjTypeActualTrn && expendituresAreEnabled) {
      const ub = VC.UNALLOCATED_DISBURSEMENTS;
      measuresTotals[ub] = this.props.activityFundingTotals.getTotals(ub, {});
    }
    // Other measures: "Total MTEF Projections".
    if (FeatureManager.isFMSettingEnabled(FeatureManagerConstants.MTEF_PROJECTIONS)) {
      measuresTotals[VC.MTEF_PROJECTIONS] = this.props.activityFundingTotals.getMTEFTotal();
    }
    // Other measures: "Delivery rate".
    if (FeatureManager.isFMSettingEnabled(FeatureManagerConstants.ACTIVITY_DELIVERY_RATE)) {
      const actualCommitments = measuresTotals[`${VC.ACTUAL} ${ActivityConstants.COMMITMENTS}`];
      const actualDisbursements = measuresTotals[`${VC.ACTUAL} ${ActivityConstants.DISBURSEMENTS}`];
      let value = 0;
      if (actualCommitments && actualDisbursements && acEnabled && adEnabled) {
        value = (actualDisbursements / actualCommitments) * 100;
      }
      measuresTotals[VC.DELIVERY_RATE] = value;
    }

    return this._buildTotalFields(measuresTotals);
  }

  _buildTotalFields(measuresTotals) {
    const measuresOrder = [
      { trn: VC.ACTUAL_COMMITMENTS, total: true },
      { trn: VC.PLANNED_COMMITMENTS, total: true },
      { trn: VC.ACTUAL_DISBURSEMENTS, total: true },
      { trn: VC.PLANNED_DISBURSEMENTS, total: true },
      { trn: VC.ACTUAL_EXPENDITURES, total: true },
      { trn: VC.UNALLOCATED_DISBURSEMENTS, total: false },
      { trn: VC.PLANNED_EXPENDITURES, total: true },
      { trn: VC.MTEF_PROJECTIONS, total: true },
      { trn: VC.DELIVERY_RATE, total: false, isPercentage: true }];
    const fundingInfoSummary = [];
    measuresOrder.forEach(measure => {
      let value = measuresTotals[measure.trn];
      if (value !== undefined) {
        value = this.props.activityFundingTotals.formatAmount(value, measure.isPercentage);
        let title = measure.trn;
        if (measure.total) {
          title = `Total ${title}`;
        }
        title = translate(title);
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
