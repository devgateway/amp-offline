import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import styles from './APFundingItem.css';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';

const logger = new Logger('AP Funding item');

/**
 * @author Gabriel Inchauspe
 */
class APFundingItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    wsCurrency: PropTypes.string.isRequired
  };
  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager)
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    logger.log('render');
    const convertedAmount = this.context.currencyRatesManager.convertTransactionAmountToCurrency(this.props.item,
      this.props.wsCurrency);
    return (
      <tbody>
        <tr className={styles.row}>
          <td className={styles.left_text}>{translate(this.props.item[AC.ADJUSTMENT_TYPE].value)}</td>
          <td className={styles.right_text}>{createFormattedDate(this.props.item[AC.TRANSACTION_DATE])}</td>
          <td
            className={styles.right_text}>
            {`${rawNumberToFormattedString(convertedAmount)} ${this.props.wsCurrency}`}</td>
        </tr>
      </tbody>);
  }
}

export default APFundingItem;
