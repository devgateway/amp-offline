import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import APFundingItem from './APFundingItem';
import styles from './APFundingTransactionTypeItem.css';
import APFundingTotalItem from './APFundingTotalItem';
import APLabel from '../../components/APLabel';

/**
 * @author Gabriel Inchauspe
 */
class APFundingTransactionTypeItem extends Component {

  static propTypes = {
    fundingDetails: PropTypes.array.isRequired,
    group: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _filterFundingDetails() {
    return (this.props.fundingDetails.filter(o => o[AC.TRANSACTION_TYPE].id === this.props.group.trnType.id
    && o[AC.ADJUSTMENT_TYPE].id === this.props.group.adjType.id));
  }

  _drawHeader() {
    const label = `${translate(this.props.group.adjType.value)} ${translate(this.props.group.trnType.value)}`;
    const key = this.props.group.adjType.value + this.props.group.trnType.value;
    return <APLabel label={label} className={styles.header} key={key} />;
  }

  _drawDetail() {
    const filteredFD = this._filterFundingDetails();
    const content = [];
    filteredFD.forEach((item) => {
      content.push(<APFundingItem item={item} key={item.id} />);
    });
    // Not worth the effort to use BootstrapTable here.
    return <table className={styles.funding_table} >{content}</table>;
  }

  _drawSubTotalFooter() {
    let subtotal = 0;
    this._filterFundingDetails().map(item => (subtotal += item[AC.TRANSACTION_AMOUNT]));
    return (<div>
      <APFundingTotalItem
        value={subtotal}
        label={translate(`Subtotal ${this.props.group.adjType.value} ${this.props.group.trnType.value}`)}
        currency={translate(this.props.group.currency.value)}
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
