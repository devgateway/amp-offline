import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Section from './Section';
import APField from '../components/APField';
import * as VC from '../../../../utils/constants/ValueConstants';
import * as FPC from '../../../../utils/constants/FieldPathConstants';
import * as FMC from '../../../../utils/constants/FeatureManagerConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';
import FeatureManager from '../../../../modules/util/FeatureManager';
import * as AC from '../../../../utils/constants/ActivityConstants';

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
    const { isFieldPathByPartsEnabled } = this.props.activityFieldsManager;
    // Commitments, Disbursements, Expenditures
    FPC.TRANSACTION_TYPES.forEach(trnType => {
      // actual, planned
      FPC.ADJUSTMENT_TYPES.forEach(adjType => {
        if (this.props.activityFieldsManager.isFieldPathByPartsEnabled(AC.FUNDINGS, trnType, adjType)) {
          const value = this.props.activityFundingTotals.getTotals(adjType, trnType, {});
          measuresTotals[`${adjType} ${trnType}`] = value;
        }
      });
    });
    // Other measures: "Unallocated Disbursements".
    const adjTypeActualTrn = this.props.activityFieldsManager.getValue(FPC.DISBURSEMENTS_PATH, AC.ACTUAL);
    const expendituresAreEnabled = isFieldPathByPartsEnabled(AC.FUNDINGS, AC.EXPENDITURES);
    if (adjTypeActualTrn && expendituresAreEnabled) {
      const ub = VC.UNALLOCATED_DISBURSEMENTS;
      measuresTotals[ub] = this.props.activityFundingTotals.getTotals(ub, {});
    }
    // Other measures: "Total MTEF Projections".
    if (FeatureManager.isFMSettingEnabled(FMC.MTEF_PROJECTIONS)) {
      measuresTotals[VC.MTEF_PROJECTIONS] = this.props.activityFundingTotals.getMTEFTotal();
    }
    // Other measures: "Delivery rate".
    if (FeatureManager.isFMSettingEnabled(FMC.ACTIVITY_DELIVERY_RATE)) {
      const actualCommitments = measuresTotals[`${AC.ACTUAL} ${AC.COMMITMENTS}`];
      const actualDisbursements = measuresTotals[`${AC.ACTUAL} ${AC.DISBURSEMENTS}`];
      let value = 0;
      if (actualCommitments && actualDisbursements && isFieldPathByPartsEnabled(AC.FUNDINGS, AC.COMMITMENTS, AC.ACTUAL)
        && isFieldPathByPartsEnabled(AC.FUNDINGS, AC.DISBURSEMENTS, AC.ACTUAL)) {
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
