/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn, InsertButton, InsertModalFooter } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from '../../components/AFList.css';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFPPCAnnualBudgetsModal from './components/AFPPCAnnualBudgetsModal';

/**
 * @author Gabriel Inchauspe
 */
export default class AFPPCAnnualBudgets extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired,
    formatAmount: PropTypes.func.isRequired,
    formatCurrency: PropTypes.func.isRequired
  };

  static onAfterSaveCell(currencies, row, cellName, cellValue) {
    if (cellName === AC.CURRENCY) {
      const currency = Object.values(currencies).find(k => k.value === cellValue);
      row[AC.CURRENCY] = currency;
    } else if (cellName === AC.YEAR) {
      const year = `${cellValue}-01-01T00:00:00.001-0000`;
      row[AC.YEAR] = year;
    }
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  onDeleteRow(ids) {
    ids.forEach(index => {
      const i = this.props.activity[AC.PPC_ANNUAL_BUDGETS]
        .findIndex(item => (item[AC.ANNUAL_PROJECT_BUDGET_ID] === index));
      this.props.activity[AC.PPC_ANNUAL_BUDGETS].splice(i, 1);
    });
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

  formatYear(years, cell) {
    if (years.indexOf(cell) !== -1) {
      return `<span className=${styles.editable}>${cell}</span>`; // Notice the `` for editable cell.
    } else {
      const auxDate = Date.parse(cell);
      const year = new Date(auxDate).getUTCFullYear();
      return <span className={styles.editable}>{year}</span>;
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

  beforeSave(e) {
  }

  handleSave(save) {
    // Custom your onSave event here,
    // it's not necessary to implement this function if you have no any process before save
    console.log('This is my custom function for save event');
    save();
  }

  handleInsertButtonClick(onClick) {
    onClick();
  }

  onAfterInsertRow(data) {
    debugger
    data[AC.CURRENCY] = Object.values(this.getListOfCurrencies(true)).find(item => item.value === data[AC.CURRENCY]);
    data.annual_project_budget_id = 10;
    return data;
  }

  createCustomInsertButton(onClick) {
    return (
      <InsertButton
        btnText={translate('Add Projection')}
        onClick={() => this.handleInsertButtonClick(onClick)}
      />
    );
  }

  createCustomModalFooter = (closeModal, save) => {
    return (
      <InsertModalFooter
        beforeSave={this.beforeSave}
        onModalClose={() => this.handleModalClose(closeModal)}
        onSave={() => this.handleSave(save)}
      />
    );
  };

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
      const cellEdit = {
        mode: 'click',
        blurToSave: true,
        afterSaveCell: AFPPCAnnualBudgets.onAfterSaveCell.bind(null, this.getListOfCurrencies(true))
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
          dataField={AC.AMOUNT} editable={{ validator: this.numberValidator }} key={AC.AMOUNT}
          dataFormat={this.props.formatAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_ANNUAL_BUDGETS}~${AC.CURRENCY}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY} key={AC.CURRENCY}
          editable={{ type: 'select', options: { values: this.getListOfCurrencies(false) } }}
          dataFormat={this.props.formatCurrency}>{translate('Currency')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_ANNUAL_BUDGETS}~${AC.YEAR}`)) {
        const years = this.getListOfYears();
        columns.push(<TableHeaderColumn
          dataField={AC.YEAR} key={AC.YEAR}
          editable={{ type: 'select', options: { values: years } }}
          dataFormat={this.formatYear.bind(null, years)}>{translate('Year')}</TableHeaderColumn>);
      }
      return (<div>
        <span><label htmlFor={AC.PPC_ANNUAL_BUDGETS}>{translate('Annual Proposed Project Cost')}</label></span>
        <BootstrapTable
          options={options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} cellEdit={cellEdit} hover selectRow={selectRow} deleteRow
          data={this.props.activity[AC.PPC_ANNUAL_BUDGETS]} insertRow>
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}
