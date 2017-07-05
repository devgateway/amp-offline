import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import styles from './APFundingTransactionTypeItem.css';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';

/**
 * @author Gabriel Inchauspe
 */
class APFundingTotalItem extends Component {

  static propTypes = {
    value: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    dontFormatNumber: PropTypes.bool,
    isPercentage: PropTypes.bool
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    LoggerManager.log('render');
    // Note: dont translate the label because it might be a phrase composed by individually translated words.
    let val = (this.props.dontFormatNumber === false
      ? this.props.value
      : rawNumberToFormattedString(this.props.value));
    val = (this.props.isPercentage === true ? val += '%' : val);
    return (<div className={styles.subtotal_footer}>
      <div className={styles.subtotal_footer_legend}>
        {`${this.props.label}:`}
      </div>
      <div className={styles.subtotal_footer_number}>
        {`${val}
        ${this.props.currency}`}
      </div>
    </div>);
  }
}

export default APFundingTotalItem;
