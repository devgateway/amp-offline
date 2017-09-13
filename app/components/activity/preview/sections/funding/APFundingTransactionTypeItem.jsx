import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import APFundingItem from './APFundingItem';
import styles from './APFundingTransactionTypeItem.css';
import APFundingTotalItem from './APFundingTotalItem';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import APLabel from '../../components/APLabel';

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
    LoggerManager.log('constructor');
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
    return <APLabel label={label} className={styles.header} key={key} />;
  }

  _drawDetail() {
    const filteredFD = this._filterFundingDetails();
    const content = [];
    filteredFD.forEach((item) => {
      content.push(<APFundingItem item={item} key={item.id} wsCurrency={this._currency} />);
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
    LoggerManager.log('render');
    // TODO: Add Undisbursed Balance section.
    return (<div className={styles.table_container} >
      <div>{this._drawHeader()}</div>
      <div>{this._drawDetail()}</div>
      <div>{this._drawSubTotalFooter()}</div>
    </div>);
  }
}

export default APFundingTransactionTypeItem;
