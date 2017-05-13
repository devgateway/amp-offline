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
    return (<div className={styles.header}>
      {translate(this.props.group.adjType.value)} {translate(this.props.group.trnType.value)}
    </div>);
  }

  _drawDetail() {
    const filteredFD = this.props.fundingDetails.filter(o => o[AC.TRANSACTION_TYPE].id === this.props.group.trnType.id
    && o[AC.ADJUSTMENT_TYPE].id === this.props.group.adjType.id);
    const content = [];
    filteredFD.forEach((item) => {
      content.push(<APFundingItem item={item} />);
    });
    return content;
  }

  render() {
    return (<div>
      <div>{this._drawHeader()}</div>
      <div>{this._drawDetail()}</div>
    </div>);
  }
}

export default APFundingTransactionTypeItem;

