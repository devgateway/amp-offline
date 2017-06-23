import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import styles from './APFundingItem.css';

/**
 * @author Gabriel Inchauspe
 */
class APFundingItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    wsCurrency: PropTypes.object.isRequired
  };
  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager)
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    LoggerManager.log('render');
    const convertedAmount = this.context.currencyRatesManager.convertTransactionAmountToCurrency(this.props.item,
      this.props.wsCurrency);
    return (
      <tbody>
        <tr>
          <td className={styles.left_text}>{translate(this.props.item[AC.ADJUSTMENT_TYPE].value)}</td>
          <td className={styles.right_text}>{createFormattedDate(this.props.item[AC.TRANSACTION_DATE])}</td>
          <td className={styles.right_text}>{`${convertedAmount} ${translate(this.props.wsCurrency)}`}</td>
        </tr>
      </tbody>);
  }
}

export default APFundingItem;
