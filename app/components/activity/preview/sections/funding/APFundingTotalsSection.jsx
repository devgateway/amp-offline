import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';
import translate from '../../../../../utils/translate';
import APFundingTotalItem from './APFundingTotalItem';
import ActivityFundingTotals from '../../../../../modules/activity/ActivityFundingTotals';
import Utils from '../../../../../utils/Utils';

const logger = new Logger('AP funding totals section');

/**
 * @author Gabriel Inchauspe
 */
class APFundingTotalsSection extends Component {

  static contextTypes = {
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    logger.debug('constructor');
    this._wsCurrency = context.currentWorkspaceSettings.currency.code;
  }

  render() {
    const content = [];
    const getTotals = this.context.activityFundingTotals.getTotals;
    const actualCommitments = getTotals(AC.ACTUAL, AC.COMMITMENTS);
    const actualDisbursements = getTotals(AC.ACTUAL, AC.DISBURSEMENTS);
    const options = [];
    FPC.TRANSACTION_TYPES.forEach(trnType => FPC.ADJUSTMENT_TYPES.forEach(adjType => {
      options.push({ label: translate(`Total ${adjType} ${trnType}`), value: getTotals(adjType, trnType) });
    }));
    options.forEach(g => {
      if (g.value > 0) {
        content.push(<APFundingTotalItem
          key={Utils.numberRandom()}
          currency={translate(this._wsCurrency)}
          value={g.value}
          label={g.label} />);
      }
    });
    if (actualDisbursements && actualCommitments) {
      content.push(<APFundingTotalItem
        label={translate('Undisbursed Balance')} value={actualCommitments - actualDisbursements}
        currency={translate(this._wsCurrency)} key={Utils.numberRandom()} />);
    }
    if (actualDisbursements && actualCommitments) {
      content.push(<APFundingTotalItem
        currency={translate(this._wsCurrency)} key={Utils.numberRandom()}
        value={Math.round((actualDisbursements / actualCommitments) * 100)}
        label={translate('Delivery rate')} isPercentage />);
    }
    return (<div>{content}</div>);
  }
}

export default APFundingTotalsSection;
