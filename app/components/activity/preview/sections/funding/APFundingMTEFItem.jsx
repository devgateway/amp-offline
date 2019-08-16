import React, { Component, PropTypes } from 'react';
import Moment from 'moment';
import { connect } from 'react-redux';
import { ActivityConstants, CurrencyRatesManager, FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import styles from './APFundingItem.css';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';
import translate from '../../../../../utils/translate';
import stylesMTEF from './APFundingMTEF.css';
import { IS_FISCAL } from '../../../../../utils/constants/CalendarConstants';

const logger = new Logger('AP Funding MTEF item');

/**
 * @author Gabriel Inchauspe
 */
class APFundingMTEFItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    wsCurrency: PropTypes.string.isRequired,
    calendar: PropTypes.object.isRequired
  };

  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
  };

  _formatDate(date) {
    const isFiscalCalendar = this.props.calendar[IS_FISCAL];
    const year = Moment(date).year();
    return isFiscalCalendar ? `${year} / ${year + 1}` : year;
  }

  render() {
    const { item, wsCurrency } = this.props;
    logger.debug('render');
    const convertedAmount = this.context.currencyRatesManager.convertAmountToCurrency(item[ActivityConstants.AMOUNT],
      item[ActivityConstants.CURRENCY].value, item[ActivityConstants.PROJECTION_DATE], null, wsCurrency);
    return (
      <tbody>
        <tr className={styles.row}>
          <td className={styles.left_text}>{translate(item[ActivityConstants.PROJECTION].value)}</td>
          <td className={stylesMTEF.td_20} />
          <td className={styles.right_text}>{this._formatDate(item[ActivityConstants.PROJECTION_DATE])}</td>
          <td className={styles.right_text}>
            {`${rawNumberToFormattedString(convertedAmount)} ${wsCurrency}`}
          </td>
          <td className={stylesMTEF.td_11} />
        </tr>
      </tbody>);
  }
}

export default connect(
  state => ({
    calendar: state.startUpReducer.calendar
  })
)(APFundingMTEFItem);
