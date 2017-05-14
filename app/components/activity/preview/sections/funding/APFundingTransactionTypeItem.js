import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import APFundingItem from './APFundingItem';
import styles from './APFundingTransactionTypeItem.css';

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

  _drawHeader() {
    // TODO: Create an APLabel with translation and tooltip.
    return (<div className={styles.header}>
      {translate(this.props.group.adjType.value)} {translate(this.props.group.trnType.value)}
    </div>);
  }

  _drawDetail() {
    const filteredFD = this.props.fundingDetails.filter(o => o[AC.TRANSACTION_TYPE].id === this.props.group.trnType.id
    && o[AC.ADJUSTMENT_TYPE].id === this.props.group.adjType.id);
    // TODO: Question, is it worth it the effort to use <BootstrapTable> here? (lots of changes in styles).
    const content = [];
    filteredFD.forEach((item) => {
      content.push(<APFundingItem item={item} key={item.id} />);
    });
    return <table className={styles.funding_table}>{content}</table>;
  }

  render() {
    LoggerManager.log('render');
    return (<div>
      <div>{this._drawHeader()}</div>
      <div>{this._drawDetail()}</div>
    </div>);
  }
}

export default APFundingTransactionTypeItem;

