import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, CurrencyRatesManager, FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from './APFundingItem.css';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';

const logger = new Logger('AP Funding item');

/**
 * @author Gabriel Inchauspe
 */
export default class APFundingItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    trnType: PropTypes.string.isRequired,
    wsCurrency: PropTypes.string.isRequired,
    buildSimpleField: PropTypes.func.isRequired,
    showDisasterResponse: PropTypes.bool.isRequired,
    showPledge: PropTypes.bool.isRequired,
    showFixedExchangeRate: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  getDisasterResponse() {
    if (this.props.showDisasterResponse && this.props.item[ActivityConstants.DISASTER_RESPONSE] === true) {
      const { activityFieldsManager } = this.context;
      return activityFieldsManager.getFieldLabelTranslation(ActivityConstants.FUNDINGS, this.props.trnType,
        ActivityConstants.DISASTER_RESPONSE);
    }
    return '';
  }

  insertPledgeRow() {
    if (this.props.item.pledge && this.props.showPledge) {
      return (<tr className={styles.row}>
        <td colSpan={ActivityConstants.AP_FUNDINGS_TABLE_COLS} className={styles.left_text}>
          <span className={styles.pledge_row}>
            <span>{`${translate('Source Pledge')}: `}</span>
            <span className={styles.value}>{`${translate(this.props.item[ActivityConstants.PLEDGE].value)}`}</span>
          </span>
        </td>
      </tr>);
    } else {
      return null;
    }
  }

  insertRecipientOrgRow() {
    const { item, buildSimpleField, trnType } = this.props;
    if (item[ActivityConstants.RECIPIENT_ORGANIZATION] && item[ActivityConstants.RECIPIENT_ROLE]) {
      const options = { noTitle: true };
      return (<tr>
        <td colSpan={ActivityConstants.AP_FUNDINGS_TABLE_COLS} className={styles.left_text}>
          <span className={styles.recipient_row}>
            <span className={styles.normal}>{`${translate('Recipient')}: `}</span>
            {buildSimpleField(`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.RECIPIENT_ORGANIZATION}`,
              true, null, true, item, null, options)}
            <span className={styles.normal}>{` ${translate('as the')} `}</span>
            {buildSimpleField(`${ActivityConstants.FUNDINGS}~${trnType}~${ActivityConstants.RECIPIENT_ROLE}`,
              true, null, true, item, null, options)}
          </span>
        </td>
      </tr>);
    } else {
      return null;
    }
  }

  insertFixedExchangeRateCell() {
    return this.props.showFixedExchangeRate ? this.props.item[ActivityConstants.FIXED_EXCHANGE_RATE] : null;
  }

  render() {
    logger.debug('render');
    const convertedAmount = this.context.currencyRatesManager.convertTransactionAmountToCurrency(this.props.item,
      this.props.wsCurrency);
    return (
      <tbody>
        <tr className={styles.row}>
          <td className={styles.left_text}>{translate(this.props.item[ActivityConstants.ADJUSTMENT_TYPE].value)}</td>
          <td className={styles.disaster_response}>{this.getDisasterResponse()}</td>
          <td className={styles.right_text}>
            {createFormattedDate(this.props.item[ActivityConstants.TRANSACTION_DATE])}
          </td>
          <td
            className={styles.right_text}>
            {`${rawNumberToFormattedString(convertedAmount)} ${this.props.wsCurrency}`}</td>
          <td className={styles.exchange_rate}>{this.insertFixedExchangeRateCell()}</td>
        </tr>
        {this.insertPledgeRow()}
        {this.insertRecipientOrgRow()}
      </tbody>);
  }
}
