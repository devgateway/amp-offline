import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import * as AF from '../../components/AFComponentTypes';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import NumberUtils from '../../../../../utils/NumberUtils';
import styles from '../../components/AFList.css';
import AFField from '../../components/AFField';

export default class AFOverallFundingTotals extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  getCurrencyCodeSelector(cell) {
    // TODO: return the list from possible value 'ppc_amount~currency_code' in a combo.
    return (<span>{cell.value ? cell.value : cell}</span>);
  }

  getAmount(cell) {
    return (<span>{NumberUtils.rawNumberToFormattedString(cell)}</span>);
  }

  render() {
    return (<div>
      TODO
    </div>);
  }
}
