import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import NumberUtils from '../../../../../utils/NumberUtils';
import styles from '../../components/AFList.css';

export default class AFProposedProjectCost extends Component {

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
    return (<span className={styles.editable}>{cell.value}</span>);
  }

  getDate(cell) {
    return (<span className={styles.editable}>{createFormattedDate(cell)}</span>);
  }

  getAmount(cell) {
    return (<span className={styles.editable}>{NumberUtils.rawNumberToFormattedString(cell)}</span>);
  }

  render() {
    const cellEdit = {
      mode: 'click',
      blurToSave: true
    };

    if (this.props.activity[AC.PPC_AMOUNT]) {
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden />];
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable
          dataFormat={this.getAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE} editable
          dataFormat={this.getCurrencyCodeSelector}>{translate('Currency')}</TableHeaderColumn>);
      }
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable
          dataFormat={this.getDate}>{translate('Date')}</TableHeaderColumn>);
      }
      return (<div>
        <BootstrapTable
          options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} cellEdit={cellEdit} hover
          data={this.props.activity[AC.PPC_AMOUNT]}>
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}
