/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from '../../components/AFList.css';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';

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
    }
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  getListOfCurrencies(returnFullObject) {
    // TODO: Check if this is the best way to get the currencies.
    const currencies = this.context.activityFieldsManager.possibleValuesMap[`${AC.PPC_ANNUAL_BUDGETS}~${AC.CURRENCY}`];
    if (returnFullObject) {
      return currencies;
    }
    return Object.keys(currencies).map((k) => (currencies[k].value));
  }

  // TODO: move to util class.
  numberValidator(value) {
    const nan = isNaN(parseFloat(value, 10));
    if (nan) {
      return translate('Not a number');
    }
    return true;
  }

  render() {
    if (this.props.activity[AC.PPC_ANNUAL_BUDGETS]) {
      const cellEdit = {
        mode: 'click',
        blurToSave: true,
        afterSaveCell: AFPPCAnnualBudgets.onAfterSaveCell.bind(null, this.getListOfCurrencies(true))
      };
      const columns = [<TableHeaderColumn dataField={AC.ANNUAL_PROJECT_BUDGET_ID} isKey hidden />];
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_ANNUAL_BUDGETS}~${AC.AMOUNT}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={{ validator: this.numberValidator }}
          dataFormat={this.props.formatAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_ANNUAL_BUDGETS}~${AC.CURRENCY}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY}
          editable={{ type: 'select', options: { values: this.getListOfCurrencies(false) } }}
          dataFormat={this.props.formatCurrency}>{translate('Currency')}</TableHeaderColumn>);
      }
      return (<div>
        <span><label htmlFor={AC.PPC_ANNUAL_BUDGETS}>{translate('Annual Proposed Project Cost')}</label></span>
        <BootstrapTable
          options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} cellEdit={cellEdit} hover
          data={this.props.activity[AC.PPC_ANNUAL_BUDGETS]}>
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}
