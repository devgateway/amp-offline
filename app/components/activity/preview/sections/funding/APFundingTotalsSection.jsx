import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';
import translate from '../../../../../utils/translate';
import APFundingTotalItem from './APFundingTotalItem';
import ActivityFundingTotals from '../../../../../modules/activity/ActivityFundingTotals';
import Utils from '../../../../../utils/Utils';
import FieldsManager from '../../../../../modules/field/FieldsManager';

const logger = new Logger('AP funding totals section');

/**
 * @author Gabriel Inchauspe
 */
class APFundingTotalsSection extends Component {

  static contextTypes = {
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
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
    const { isFieldPathByPartsEnabled, getPossibleValuesOptions } = this.context.activityFieldsManager;
    let actualCommitments;
    let actualDisbursements;
    const options = [];
    FPC.TRANSACTION_TYPES.forEach(trnType => {
      if (isFieldPathByPartsEnabled(AC.FUNDINGS, trnType)) {
        const atOptions = getPossibleValuesOptions(`${AC.FUNDINGS}~${trnType}~${AC.ADJUSTMENT_TYPE}`);
        atOptions.forEach(at => {
          const value = getTotals(at.id, trnType);
          options.push({ label: translate(`Total ${at.value} ${trnType}`), value });
          actualCommitments = (trnType === AC.COMMITMENTS && at.value === VC.ACTUAL) ? value : actualCommitments;
          actualDisbursements = (trnType === AC.DISBURSEMENTS && at.value === VC.ACTUAL) ? value : actualDisbursements;
        });
      }
    });
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
