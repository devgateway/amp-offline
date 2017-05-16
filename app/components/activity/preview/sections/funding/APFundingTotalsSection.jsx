import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import APFundingTotalItem from './APFundingTotalItem';

/**
 * @author Gabriel Inchauspe
 */
class APFundingTotalsSection extends Component {

  static propTypes = {
    fundings: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _buildTotals() {
    const content = [];
    const groups = [];
    this.props.fundings.forEach((item) => {
      item[AC.FUNDING_DETAILS].forEach(item2 => {
        const auxFd = {
          adjType: item2[AC.ADJUSTMENT_TYPE],
          trnType: item2[AC.TRANSACTION_TYPE],
          key: item2.id,
          currency: item2[AC.CURRENCY],
          amount: item2[AC.TRANSACTION_AMOUNT]
        };
        const group = groups.find(o => o.adjType.id === auxFd.adjType.id && o.trnType.id === auxFd.trnType.id);
        if (!group) {
          groups.push(auxFd);
        } else {
          group.amount += auxFd.amount;
        }
      });
    });
    groups.forEach(g => {
      content.push(<APFundingTotalItem
        key={g.key}
        currency={translate(g.currency.value)} value={g.amount}
        label={`${translate('Total')} ${translate(g.adjType.value)} ${translate(g.trnType.value)}`} />);
    });
    return content;
  }

  render() {
    return (<div>{this._buildTotals()}</div>);
  }
}

export default APFundingTotalsSection;
