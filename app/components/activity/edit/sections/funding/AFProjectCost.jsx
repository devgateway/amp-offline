/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as FP from '../../../../../utils/constants/FieldPathConstants';
import * as AF from '../../components/AFComponentTypes';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import NumberUtils from '../../../../../utils/NumberUtils';
import styles from '../../components/AFList.css';
import AFField from '../../components/AFField';
import AFOverallFundingTotals from './AFOverallFundingTotals';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';

/**
 * @author Gabriel Inchauspe
 */
export default class AFProjectCost extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired,
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
    return `<span class=${styles.editable}>${cell.value || cell}</span>`; // Notice the `` for editable cell.
  }

  getDate(cell) {
    return (<span className={styles.editable}>{createFormattedDate(cell)}</span>);
  }

  getAmount(cell) {
    return (<span className={styles.editable}>{NumberUtils.rawNumberToFormattedString(cell, true)}</span>);
  }

  getListOfCurrencies(returnFullObject) {
    // TODO: Check if this is the best way to get the currencies..
    const currencies = this.context.activityFieldsManager._possibleValuesMap[FP.PPC_AMOUNT_CURRENCY_CODE_PATH];
    if (returnFullObject) {
      return currencies; // TODO: This cant be used with the simple select provided by the table, we need a custom component.
    }
    return Object.keys(currencies).sort();
  }

  numberValidator(value) {
    const nan = isNaN(parseFloat(value, 10));
    if (nan) {
      return translate('Not a number');
    }
    return true;
  }

  generateProposedProjectCost() {
    if (this.props.activity[AC.PPC_AMOUNT]) {
      const cellEdit = {
        mode: 'click',
        blurToSave: true
      };
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden />];
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={false}
          dataFormat={this.getAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE}
          editable={{ type: 'select', options: { values: this.getListOfCurrencies(true) } }}
          dataFormat={this.getCurrencyCodeSelector}>{translate('Currency')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        // TODO: Add a datepicker component.
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
    if (this.props.activity[AC.RPC_AMOUNT]) {
      const cellEdit = {
        mode: 'click',
        blurToSave: true
      };
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden />];
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={{ validator: this.numberValidator }}
          dataFormat={this.getAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE}
          editable={{ type: 'select', options: { values: this.getListOfCurrencies(false) } }}
          dataFormat={this.getCurrencyCodeSelector}>{translate('Currency')}</TableHeaderColumn>);
      }
      // TODO: check FM.
      if (true) {
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable={{ type: 'date' }}
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
    // TODO: implement number field for 'total_number_of_funding_sources'.
    return (<div>
      {this.generateProposedProjectCost()}
      {this.generateRevisedProjectCost()}
      <AFField parent={this.props.activity} fieldPath={AC.TOTAL_NUMBER_OF_FUNDING_SOURCES} type={AF.TEXT_AREA} />
      <AFField parent={this.props.activity} fieldPath={AC.TYPE_OF_COOPERATION} />
      <AFField parent={this.props.activity} fieldPath={AC.TYPE_OF_IMPLEMENTATION} />
      <AFField parent={this.props.activity} fieldPath={AC.MODALITIES} />
      <AFOverallFundingTotals activity={this.props.activity} />
    </div>);
  }
}
