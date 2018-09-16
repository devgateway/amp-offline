import React, { Component, PropTypes } from 'react';
import Moment from 'moment';
import Logger from '../../../../../modules/util/LoggerManager';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import styles from './APFundingItem.css';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';
import FieldsManager from '../../../../../modules/field/FieldsManager';

const logger = new Logger('AP Funding MTEF item');

/**
 * @author Gabriel Inchauspe
 */
class APFundingMTEFItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    wsCurrency: PropTypes.string.isRequired
  };

  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
  };

  static _formatDate(date) {
    const isFiscalCalendar = true; // TODO: After we sync calendars data (AMPOFFLINE-1228) update this flag.
    const year = Moment(date).year();
    return isFiscalCalendar ? `${year} / ${year + 1}` : year;
  }

  render() {
    const { item, wsCurrency } = this.props;
    logger.log('render');
    const convertedAmount = this.context.currencyRatesManager.convertAmountToCurrency(item[AC.AMOUNT],
      item[AC.CURRENCY].value, item[AC.PROJECTION_DATE], null, wsCurrency);
    return (
      <tbody>
        <tr className={styles.row}>
          <td className={styles.left_text}>{translate('Projection')}</td>
          <td className={styles.right_text}>{APFundingMTEFItem._formatDate(item[AC.PROJECTION_DATE])}</td>
          <td
            className={styles.right_text}>
            {`${rawNumberToFormattedString(convertedAmount)} ${wsCurrency}`}
          </td>
        </tr>
      </tbody>);
  }
}

export default APFundingMTEFItem;
