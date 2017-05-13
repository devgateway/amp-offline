import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';
import styles from './APFundingItem.css';

/**
 * @author Gabriel Inchauspe
 */
class APFundingItem extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (
      <tr>
        <td>{translate(this.props.item[AC.ADJUSTMENT_TYPE].value)}</td>
        <td className={styles.right_text}>{createFormattedDate(this.props.item[AC.TRANSACTION_DATE])}</td>
        <td className={styles.right_text}>{rawNumberToFormattedString(this.props.item[AC.TRANSACTION_AMOUNT])}
          {translate(this.props.item[AC.CURRENCY].value)}</td>
      </tr>);
  }
}

export default APFundingItem;
