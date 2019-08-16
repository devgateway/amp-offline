import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, CurrencyRatesManager, FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import APFundingItem from './APFundingItem';
import styles from './APFundingTransactionTypeItem.css';
import APFundingTotalItem from './APFundingTotalItem';
import APLabel from '../../components/APLabel';
import Utils from '../../../../../utils/Utils';

const logger = new Logger('AP Funding transaction type item');

/**
 * @author Gabriel Inchauspe
 */
export default class APFundingTransactionTypeItem extends Component {

  static contextTypes = {
    currentWorkspaceSettings: PropTypes.object.isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
  };

  static propTypes = {
    trnType: PropTypes.string.isRequired,
    fundingDetails: PropTypes.array.isRequired,
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props);
    logger.debug('constructor');
    this._currency = context.currentWorkspaceSettings.currency.code;
    this._adjType = props.fundingDetails[0][ActivityConstants.ADJUSTMENT_TYPE];
    this._measure = `${this._adjType.value} ${props.trnType}`;
    this._key = this._adjType.value + props.trnType;
    const trnPath = `${ActivityConstants.FUNDINGS}~${props.trnType}`;
    this._showFixedExRate = context.activityFieldsManager
      .isFieldPathEnabled(`${trnPath}~${ActivityConstants.FIXED_EXCHANGE_RATE}`);
    this._showDisasterResponse = context.activityFieldsManager
      .isFieldPathEnabled(`${trnPath}~${ActivityConstants.DISASTER_RESPONSE}`);
    this._showPledge = context.activityFieldsManager
      .isFieldPathEnabled(`${trnPath}~${ActivityConstants.PLEDGE}`);
  }

  _drawHeader() {
    return (
      <div>
        <APLabel label={translate(this._measure)} labelClass={styles.header} key={this._key} />
        {this._showFixedExRate ?
          <APLabel label={translate('Fixed Exchange Rate')} labelClass={styles.exchange_rate} /> : null}
      </div>);
  }

  _drawDetail() {
    const { fundingDetails, trnType } = this.props;
    return (<table className={styles.funding_table}>
      {fundingDetails.map(item =>
        <APFundingItem
          item={item} trnType={trnType} key={Utils.numberRandom()} wsCurrency={this._currency}
          showDisasterResponse={this._showDisasterResponse} showPledge={this._showPledge}
          showFixedExchangeRate={this._showFixedExRate}
          buildSimpleField={this.props.buildSimpleField} />)
      }
    </table>);
  }

  _drawSubTotalFooter() {
    const { fundingDetails } = this.props;
    const subtotal = this.context.currencyRatesManager.convertFundingDetailsToCurrency(fundingDetails, this._currency);
    const labelTrn = translate(`Subtotal ${this._measure}`).toUpperCase();
    return (
      <div>
        <APFundingTotalItem value={subtotal} label={labelTrn} currency={translate(this._currency)} key={this._key} />
      </div>);
  }

  render() {
    logger.debug('render');
    return (<div className={styles.table_container}>
      <div>{this._drawHeader()}</div>
      <div>{this._drawDetail()}</div>
      <div>{this._drawSubTotalFooter()}</div>
    </div>);
  }
}
