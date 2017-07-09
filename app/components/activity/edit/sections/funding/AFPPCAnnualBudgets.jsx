/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn, InsertButton, InsertModalFooter } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from '../../components/AFList.css';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';

/**
 * @author Gabriel Inchauspe
 */
export default class AFPPCAnnualBudgets extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  /**
   * This function is called after editing an existing cell.
   * @param row
   * @param cellName
   * @param cellValue
   */
  static onAfterSaveCell(row, cellName, cellValue) {
    if (cellName === AC.CURRENCY) {
      // Convert currency string to currency object.
      row[AC.CURRENCY] = this._generateCurrencyObject(cellValue);
    } else if (cellName === AC.YEAR) {
      // Convert year string to full date string.
      row[AC.YEAR] = this._generateYearString(cellValue);
    } else if (cellName === AC.AMOUNT) {
      row[AC.AMOUNT] = Number.parseFloat(cellValue, 10);
    }
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  /**
   * Implement row delete by id.
   * @param ids
   */
  onDeleteRow(ids) {
    ids.forEach(index => {
      const i = this.props.activity[AC.PPC_ANNUAL_BUDGETS]
        .findIndex(item => (item[AC.ANNUAL_PROJECT_BUDGET_ID] === index));
      this.props.activity[AC.PPC_ANNUAL_BUDGETS].splice(i, 1);
    });
  }

  /**
   * Convert the object from modal window to the same format in AC.PPC_ANNUAL_BUDGETS, then add it to the activity.
   * @param data
   * @returns {*}
   */
  onAfterInsertRow(data) {
    const newPPC = {};
    newPPC[AC.CURRENCY] = this._generateCurrencyObject(data[AC.CURRENCY]);
    newPPC[AC.ANNUAL_PROJECT_BUDGET_ID] = this._generateId();
    newPPC[AC.AMOUNT] = Number.parseFloat(data[AC.AMOUNT], 10);
    newPPC[AC.YEAR] = this._generateYearString(data[AC.YEAR]);
    // Add it to the activity because is not done automatically.
    this.props.activity[AC.PPC_ANNUAL_BUDGETS].push(newPPC);
    return newPPC;
  }

  getListOfCurrencies(returnFullObject) {
    // TODO: Check if this is the best way to get the currencies.
    const currencies = this.context.activityFieldsManager.possibleValuesMap[`${AC.PPC_ANNUAL_BUDGETS}~${AC.CURRENCY}`];
    if (returnFullObject) {
      return currencies;
    }
    return Object.keys(currencies).map((k) => (currencies[k].value));
  }

  getListOfYears() {
    // TODO: check how many years to generate.
    return Array.from(new Array(30), (x, i) => i + 1990);
  }

  _generateCurrencyObject(currencyCode) {
    return Object.values(this.getListOfCurrencies(true)).find(item => item.value === currencyCode);
  }

  _generateId() {
    return Number.parseInt(Math.random() * 1000, 10);
  }

  _generateYearString(year) {
    return `${year}-01-01T00:00:00.001-0000`;
  }

  /**
   * Generate the value we see in the table for years column, the code is different for editing cell.
   * @param years
   * @param cell
   * @returns {*}
   */
  formatYear(years, cell) {
    if (years.indexOf(cell) !== -1) {
      return `<span className=${styles.editable}>${cell}</span>`; // Notice the `` for editable cell.
    } else {
      const auxDate = Date.parse(cell);
      const year = new Date(auxDate).getUTCFullYear();
      return <span className={styles.editable} >{year}</span>;
    }
  }

  // TODO: move to util class.
  numberValidator(value) {
    const nan = isNaN(parseFloat(value, 10));
    if (nan) {
      return translate('Not a number');
    }
    return true;
  }

  handleInsertButtonClick(onClick) {
    onClick();
  }

  handleModalClose(closeModal) {
    closeModal();
  }

  createCustomInsertButton(onClick) {
    return (
      <InsertButton
        btnText={translate('Add Projection')}
        onClick={() => this.handleInsertButtonClick(onClick)}
      />
    );
  }

  createCustomModalFooter = (closeModal) => (
    <InsertModalFooter
      onModalClose={() => this.handleModalClose(closeModal)}
    />
  );

  render() {
    // TODO: replace all translate for column names for the corresponding translated-value from possible-values.db.
    // TODO: maybe to have a "column component" too?
    if (this.props.activity[AC.PPC_ANNUAL_BUDGETS]) {
      const options = {
        withoutNoDataText: true,
        onDeleteRow: this.onDeleteRow.bind(this),
        insertBtn: this.createCustomInsertButton.bind(this),
        insertModalFooter: this.createCustomModalFooter,
        afterInsertRow: this.onAfterInsertRow.bind(this)
      };
      const selectRow = {
        mode: 'checkbox'
      };
      const columns = [<TableHeaderColumn
        dataField={AC.ANNUAL_PROJECT_BUDGET_ID} isKey hidden hiddenOnInsert editable={false}
        key={AC.ANNUAL_PROJECT_BUDGET_ID} autoValue
      />];
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_ANNUAL_BUDGETS}~${AC.AMOUNT}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={false} key={AC.AMOUNT}
          dataFormat={(cell, row, other, index) => (
            <AFField
              parent={this.props.activity[AC.PPC_ANNUAL_BUDGETS][index]}
              fieldPath={`${AC.PPC_ANNUAL_BUDGETS}~${AC.AMOUNT}`}
              type={Types.NUMBER} showLabel={false} />)} >{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_ANNUAL_BUDGETS}~${AC.CURRENCY}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY} key={AC.CURRENCY}
          editable={false}
          dataFormat={(cell, row, other, index) => (
            <AFField
              parent={this.props.activity[AC.PPC_ANNUAL_BUDGETS][index]}
              fieldPath={`${AC.PPC_ANNUAL_BUDGETS}~${AC.CURRENCY}`}
              type={Types.DROPDOWN} showLabel={false} />)} >{translate('Currency')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_ANNUAL_BUDGETS}~${AC.YEAR}`)) {
        // TODO: we need to show a list of years but we have a string representing a date (check the original solution).
        columns.push(<TableHeaderColumn
          dataField={AC.YEAR} key={AC.YEAR}
          editable={false}
          dataFormat={(cell, row, other, index) => (
            <AFField
              parent={this.props.activity[AC.PPC_ANNUAL_BUDGETS][index]}
              fieldPath={`${AC.PPC_ANNUAL_BUDGETS}~${AC.YEAR}`}
              type={Types.NUMBER} showLabel={false} />)} >{translate('Year')}</TableHeaderColumn>);
      }
      return (<div>
        <span><label htmlFor={AC.PPC_ANNUAL_BUDGETS} >{translate('Annual Proposed Project Cost')}</label></span>
        <BootstrapTable
          options={options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} hover selectRow={selectRow} deleteRow
          data={this.props.activity[AC.PPC_ANNUAL_BUDGETS]} insertRow >
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}
