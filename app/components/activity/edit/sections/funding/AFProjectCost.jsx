import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as VC from '../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import NumberUtils from '../../../../../utils/NumberUtils';
import styles from '../../components/AFList.css';

export default class AFProjectCost extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
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
    return (<span className={styles.editable}>{cell.value ? cell.value : cell}</span>);
  }

  getDate(cell) {
    return (<span className={styles.editable}>{createFormattedDate(cell)}</span>);
  }

  getAmount(cell) {
    return (<span className={styles.editable}>{NumberUtils.rawNumberToFormattedString(cell)}</span>);
  }

  generateProposedProjectCost() {
    if (this.props.type === VC.PROPOSED_PROJECT_COST && this.props.activity[AC.PPC_AMOUNT]) {
      const cellEdit = {
        mode: 'click',
        blurToSave: true
      };

      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden />];
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable
          dataFormat={this.getAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE} editable
          dataFormat={this.getCurrencyCodeSelector}>{translate('Currency')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable
          dataFormat={this.getDate}>{translate('Date')}</TableHeaderColumn>);
      }
      return (<div>
        <span><label htmlFor="ppc_table">{translate('Proposed Project Cost')}</label></span>
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

  generateRevisedProjectCost() {
    if (this.props.type === VC.REVISED_PROJECT_COST && this.props.activity[AC.RPC_AMOUNT]) {
      const cellEdit = {
        mode: 'click',
        blurToSave: true
      };

      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden />];
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable
          dataFormat={this.getAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE} editable
          dataFormat={this.getCurrencyCodeSelector}>{translate('Currency')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable
          dataFormat={this.getDate}>{translate('Date')}</TableHeaderColumn>);
      }
      return (<div>
        <span><label htmlFor="rpc_table">{translate('Revised Project Cost')}</label></span>
        <BootstrapTable
          options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} cellEdit={cellEdit} hover
          data={this.props.activity[AC.RPC_AMOUNT]}>
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }

  render() {
    return (<div>
      {this.generateProposedProjectCost()}
      {this.generateRevisedProjectCost()}
    </div>);
  }
}
