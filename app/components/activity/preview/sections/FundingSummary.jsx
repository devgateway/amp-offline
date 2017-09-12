import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APField from '../components/APField';
import * as VC from '../../../../utils/constants/ValueConstants';
import * as PC from '../../../../utils/constants/FieldPathConstants';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

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
    const measuresOrder = [VC.ACTUAL_COMMITMENTS, VC.PLANNED_COMMITMENTS, VC.ACTUAL_DISBURSEMENTS,
      VC.PLANNED_DISBURSEMENTS, VC.ACTUAL_EXPENDITURES, VC.UNALLOCATED_DISBURSEMENTS, VC.PLANNED_EXPENDITURES];
    const measuresTotals = {};
    let expendituresAreEnabled = false;
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
        });
        expendituresAreEnabled = (trnType === VC.EXPENDITURES);
      }
    });
    // Other measures
    const adjTypeActualTrn = this.props.activityFieldsManager.getValueTranslation(PC.ADJUSTMENT_TYPE_PATH, VC.ACTUAL);
    if (adjTypeActualTrn && expendituresAreEnabled) {
      const ub = VC.UNALLOCATED_DISBURSEMENTS;
      measuresTotals[ub] = this.props.activityFundingTotals.getTotals(ub, {});
    }

    return this._buildTotalFields(measuresOrder, measuresTotals);
  }

  _buildTotalFields(measuresOrder, measuresTotals) {
    const fundingInfoSummary = [];
    const totalTrn = translate('Total');
    measuresOrder.forEach(measure => {
      const value = measuresTotals[measure];
      if (value !== undefined) {
        const title = `${totalTrn} ${translate(measure)}`;
        const key = `Summary-Total-${measure}`;
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
