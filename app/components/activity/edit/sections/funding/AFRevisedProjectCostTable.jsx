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
export default class AFPRevisedProjectCostTable extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired,
    formatAmount: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    formatCurrency: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  getListOfCurrencies(returnFullObject) {
    // TODO: Check if this is the best way to get the currencies.
    const currencies = this.context.activityFieldsManager.possibleValuesMap[`${AC.RPC_AMOUNT}~${AC.CURRENCY_CODE}`];
    if (returnFullObject) {
      return currencies;
    }
    return Object.keys(currencies).sort();
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
    if (this.props.activity[AC.RPC_AMOUNT]) {
      const cellEdit = {
        mode: 'click',
        blurToSave: true
      };
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden />];
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.RPC_AMOUNT}~${AC.AMOUNT}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={{ validator: this.numberValidator }}
          dataFormat={this.props.formatAmount}>{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.RPC_AMOUNT}~${AC.CURRENCY_CODE}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE}
          editable={{ type: 'select', options: { values: this.getListOfCurrencies(false) } }}
          dataFormat={this.props.formatCurrency}>{translate('Currency')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.RPC_AMOUNT}~${AC.FUNDING_DATE}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable={{ type: 'date' }}
          dataFormat={this.props.formatDate}>{translate('Date')}</TableHeaderColumn>);
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
}
