import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import { rawNumberToFormattedString } from '../../../../../utils/NumberUtils';

/**
 * @author Gabriel Inchauspe
 */
class APFundingTotalsSection extends Component {

  static propTypes = {
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (
      <div>TOTALES</div>);
  }
}

export default APFundingTotalsSection;
