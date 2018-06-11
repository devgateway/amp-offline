import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import APFundingItem from './APFundingItem';
import styles from './APFundingTransactionTypeItem.css';
import APFundingTotalItem from './APFundingTotalItem';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import APLabel from '../../components/APLabel';
import Utils from '../../../../../utils/Utils';
import FeatureManager from '../../../../../modules/util/FeatureManager';
import * as FMC from '../../../../../utils/constants/FeatureManagerConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';

const logger = new Logger('AP Funding transaction type item');

/**
 * @author Gabriel Inchauspe
 */
class APFundingTransactionTypeItem extends Component {

  static contextTypes = {
    currentWorkspaceSettings: PropTypes.object.isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager)
  };

  static propTypes = {
    fundingDetails: PropTypes.array.isRequired,
    group: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props);
    logger.log('constructor');
    this._currency = context.currentWorkspaceSettings.currency.code;
  }

  _filterFundingDetails() {
    return (this.props.fundingDetails.filter(o => o[AC.TRANSACTION_TYPE].id === this.props.group.trnType.id
    && o[AC.ADJUSTMENT_TYPE].id === this.props.group.adjType.id));
  }

  _drawHeader() {
    const measure = `${this.props.group.adjType.value} ${this.props.group.trnType.value}`;
    const label = translate(measure);
    const key = this.props.group.adjType.value + this.props.group.trnType.value;
    let fixedExchangeRateFMPath;
    switch (this.props.group.trnType.value) {
      case VC.COMMITMENTS:
        fixedExchangeRateFMPath = FMC.ACTIVITY_COMMITMENTS_FIXED_EXCHANGE_RATE;
        break;
      case VC.DISBURSEMENTS:
        fixedExchangeRateFMPath = FMC.ACTIVITY_DISBURSEMENTS_FIXED_EXCHANGE_RATE;
        break;
      case VC.EXPENDITURES:
        fixedExchangeRateFMPath = FMC.ACTIVITY_EXPENDITURES_FIXED_EXCHANGE_RATE;
        break;
      default:
        break;
    }
    return (<div>
      <APLabel label={label} labelClass={styles.header} key={key} />
      {FeatureManager.isFMSettingEnabled(fixedExchangeRateFMPath) ?
        <APLabel label={translate('Exchange Rate')} labelClass={styles.exchange_rate} /> : null}
    </div>);
  }

  _drawDetail() {
    const filteredFD = this._filterFundingDetails();
    const content = [];
    filteredFD.forEach((item) => {
      content.push(<APFundingItem item={item} key={Utils.numberRandom()} wsCurrency={this._currency} />);
    });
    // Not worth the effort to use BootstrapTable here.
    return <table className={styles.funding_table} >{content}</table>;
  }

  _drawSubTotalFooter() {
    let subtotal = 0;
    subtotal = this.context.currencyRatesManager.convertFundingDetailsToCurrency(this._filterFundingDetails(),
      this._currency);
    const measure = `${this.props.group.adjType.value} ${this.props.group.trnType.value}`;
    const labelTrn = translate(`Subtotal ${measure}`).toUpperCase();
    return (<div>
      <APFundingTotalItem
        value={subtotal}
        label={labelTrn}
        currency={translate(this._currency)}
        key={this.props.group.adjType.value + this.props.group.trnType.value} />
    </div>);
  }

  render() {
    logger.log('render');
    return (<div className={styles.table_container} >
      <div>{this._drawHeader()}</div>
      <div>{this._drawDetail()}</div>
      <div>{this._drawSubTotalFooter()}</div>
    </div>);
  }
}

export default APFundingTransactionTypeItem;
