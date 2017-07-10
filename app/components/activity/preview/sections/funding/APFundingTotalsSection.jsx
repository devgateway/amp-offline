import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
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

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _buildTotals() {
    const content = [];
    const groups = [];
    let sumOfActualDisbursements = 0;
    let sumOfActualCommitments = 0;
    let sumOfPlannedDisbursements = 0;
    let currency = '';
    this.props.fundings.forEach((item) => {
      item[AC.FUNDING_DETAILS].forEach(item2 => {
        const auxFd = {
          adjType: item2[AC.ADJUSTMENT_TYPE],
          trnType: item2[AC.TRANSACTION_TYPE],
          key: item2.id,
          currency: item2[AC.CURRENCY],
          amount: item2[AC.TRANSACTION_AMOUNT]
        };
        currency = auxFd.currency.value;
        const group = groups.find(o => o.adjType.id === auxFd.adjType.id && o.trnType.id === auxFd.trnType.id);
        if (!group) {
          groups.push(auxFd);
        } else {
          group.amount += auxFd.amount;
        }

        if (item2[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL && item2[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS) {
          sumOfActualDisbursements += item2[AC.TRANSACTION_AMOUNT];
        }
        if (item2[AC.ADJUSTMENT_TYPE].value === VC.PLANNED && item2[AC.TRANSACTION_TYPE].value === VC.DISBURSEMENTS) {
          sumOfPlannedDisbursements += item2[AC.TRANSACTION_AMOUNT];
        }
        if (item2[AC.ADJUSTMENT_TYPE].value === VC.ACTUAL && item2[AC.TRANSACTION_TYPE].value === VC.COMMITMENTS) {
          sumOfActualCommitments += item2[AC.TRANSACTION_AMOUNT];
        }
      });
    });
    groups.sort(this.props.comparator).forEach(g => {
      content.push(<APFundingTotalItem
        key={g.key}
        currency={translate(g.currency.value)} value={g.amount}
        label={`${translate('Total')} ${translate(g.adjType.value)} ${translate(g.trnType.value)}`} />);
    });
    if (sumOfActualDisbursements !== 0 && sumOfPlannedDisbursements !== 0) {
      content.push(<APFundingTotalItem
        label={translate('Undisbursed Balance')} value={sumOfActualCommitments - sumOfActualDisbursements}
        currency={translate(currency)} key="undisbursed-balance-key" />);
    }
    if (sumOfActualDisbursements !== 0 && sumOfPlannedDisbursements !== 0) {
      content.push(<APFundingTotalItem
        currency={translate(currency)}
        value={parseInt((sumOfPlannedDisbursements / sumOfActualDisbursements) * 100, 10)}
        label={translate('Delivery Rate')} dontFormatNumber={false} isPercentage key="planned-disbursement-key" />);
    }
    return content;
  }

  render() {
    return (<div>{this._buildTotals()}</div>);
  }
}

export default APFundingTotalsSection;
