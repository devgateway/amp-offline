import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';

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
      <div>{translate(this.props.item[AC.ADJUSTMENT_TYPE].value)}
        - {createFormattedDate(this.props.item[AC.TRANSACTION_DATE])}
        - {rawNumberToFormattedString(this.props.item[AC.TRANSACTION_AMOUNT])}
        {translate(this.props.item[AC.CURRENCY].value)}</div>);
  }
}

export default APFundingItem;
