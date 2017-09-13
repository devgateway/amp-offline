import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import translate from '../../../../../utils/translate';
import APFundingTotalItem from './APFundingTotalItem';

/**
 * @author Gabriel Inchauspe
 */
class APFundingTotalsSection extends Component {

  static propTypes = {
    fundings: PropTypes.array.isRequired,
    comparator: PropTypes.func.isRequired
  };
  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    LoggerManager.log('constructor');
    this._wsCurrency = context.currentWorkspaceSettings.currency.code;
  }

  _buildTotals() {
    const content = [];
    const groups = [];
    let sumOfActualDisbursements = 0;
    let sumOfActualCommitments = 0;
    let sumOfPlannedDisbursements = 0;

    this.props.fundings.forEach((item) => {
      item[AC.FUNDING_DETAILS].forEach(item2 => {
        const auxFd = {
          adjType: item2[AC.ADJUSTMENT_TYPE],
          trnType: item2[AC.TRANSACTION_TYPE],
          key: item2.id,
          amount: 0
        };
        const itemAmmount = this.context.currencyRatesManager.convertTransactionAmountToCurrency(item2,
          this._wsCurrency);
        const group = groups.find(o => o.adjType.id === auxFd.adjType.id && o.trnType.id === auxFd.trnType.id);
        if (!group) {
          auxFd.amount = itemAmmount;
          groups.push(auxFd);
        } else {
          group.amount += itemAmmount;
        }

        if (item2[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL && item2[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS) {
          sumOfActualDisbursements += itemAmmount;
        }
        if (item2[AC.ADJUSTMENT_TYPE].value === VC.PLANNED && item2[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS) {
          sumOfPlannedDisbursements += itemAmmount;
        }
        if (item2[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL && item2[AC.TRANSACTION_TYPE].value === VC.COMMITMENTS) {
          sumOfActualCommitments += itemAmmount;
        }
      });
    });
    groups.sort(this.props.comparator).forEach(g => {
      const measure = `${g.adjType.value} ${g.trnType.value}`;
      const labelTrn = translate(`${measure === VC.UNALLOCATED_DISBURSEMENTS ? '' : 'Total '}${measure}`);
      content.push(<APFundingTotalItem
        key={g.key}
        currency={translate(this._wsCurrency)} value={g.amount}
        label={labelTrn} />);
    });
    if (sumOfActualDisbursements !== 0 && sumOfPlannedDisbursements !== 0) {
      content.push(<APFundingTotalItem
        label={translate('Undisbursed Balance')} value={sumOfActualCommitments - sumOfActualDisbursements}
        currency={translate(this._wsCurrency)} key="undisbursed-balance-key" />);
    }
    if (sumOfActualDisbursements !== 0 && sumOfPlannedDisbursements !== 0) {
      content.push(<APFundingTotalItem
        currency={translate(this._wsCurrency)} key="planned-disbursement-key"
        value={parseInt((sumOfPlannedDisbursements / sumOfActualDisbursements) * 100, 10)}
        label={translate('Delivery Rate')} dontFormatNumber={false} isPercentage />);
    }
    return content;
  }

  render() {
    return (<div>{this._buildTotals()}</div>);
  }
}

export default APFundingTotalsSection;
