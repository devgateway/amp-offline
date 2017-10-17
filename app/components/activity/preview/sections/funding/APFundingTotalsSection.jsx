import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import translate from '../../../../../utils/translate';
import APFundingTotalItem from './APFundingTotalItem';
import ActivityFundingTotals from '../../../../../modules/activity/ActivityFundingTotals';
import Utils from '../../../../../utils/Utils';

/**
 * @author Gabriel Inchauspe
 */
class APFundingTotalsSection extends Component {

  static propTypes = {
    fundings: PropTypes.array.isRequired,
    comparator: PropTypes.func.isRequired
  };

  static contextTypes = {
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    LoggerManager.log('constructor');
    this._wsCurrency = context.currentWorkspaceSettings.currency.code;
  }

  render() {
    const content = [];
    const activityFundingTotals = this.context.activityFundingTotals;
    const actualCommitments = activityFundingTotals._buildStandardMeasureTotal(null, VC.ACTUAL, VC.COMMITMENTS);
    const plannedCommitments = activityFundingTotals._buildStandardMeasureTotal(null, VC.PLANNED, VC.COMMITMENTS);
    const actualDisbursements = activityFundingTotals._buildStandardMeasureTotal(null, VC.ACTUAL, VC.DISBURSEMENTS);
    const plannedDisbursements = activityFundingTotals._buildStandardMeasureTotal(null, VC.PLANNED, VC.DISBURSEMENTS);
    const actualExpenditures = activityFundingTotals._buildStandardMeasureTotal(null, VC.ACTUAL, VC.EXPENDITURES);
    const plannedExpenditures = activityFundingTotals._buildStandardMeasureTotal(null, VC.PLANNED, VC.EXPENDITURES);
    const options = [{ label: translate('Total Actual Commitments'), value: actualCommitments },
      { label: translate('Total Planned Commitments'), value: plannedCommitments },
      { label: translate('Total Actual Disbursements'), value: actualDisbursements },
      { label: translate('Total Planned Disbursements'), value: plannedDisbursements },
      { label: translate('Total Actual Expenditures'), value: actualExpenditures },
      { label: translate('Total Planned Expenditures'), value: plannedExpenditures }];
    options.forEach(g => {
      if (g.value > 0) {
        content.push(<APFundingTotalItem
          key={Utils.numberRandom()}
          currency={translate(this._wsCurrency)}
          value={g.value}
          label={g.label} />);
      }
    });
    if (actualDisbursements !== 0 && plannedDisbursements !== 0) {
      content.push(<APFundingTotalItem
        label={translate('Undisbursed Balance')} value={actualCommitments - actualDisbursements}
        currency={translate(this._wsCurrency)} key={Utils.numberRandom()} />);
    }
    if (actualDisbursements !== 0 && plannedDisbursements !== 0) {
      content.push(<APFundingTotalItem
        currency={translate(this._wsCurrency)} key={Utils.numberRandom()}
        value={Math.round((actualDisbursements / actualCommitments) * 100)}
        label={translate('Delivery Rate')} isPercentage />);
    }
    return (<div>{content}</div>);
  }
}

export default APFundingTotalsSection;
