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
export default class AFProposedProjectCostTable extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired,
    formatAmount: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    formatCurrency: PropTypes.func.isRequired
  };

  static onAfterSaveCell(currencies, row, cellName, cellValue) {
    if (cellName === AC.CURRENCY_CODE) {
      row[AC.CURRENCY_CODE] = currencies[cellValue];
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
    const currencies = this.context.activityFieldsManager.possibleValuesMap[`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`];
    if (returnFullObject) {
      return currencies;
    }
    return Object.keys(currencies).sort();
  }

  render() {
    if (this.props.activity[AC.PPC_AMOUNT]) {
      const cellEdit = {
        mode: 'click',
        blurToSave: true,
        afterSaveCell: AFProposedProjectCostTable.onAfterSaveCell.bind(null, this.getListOfCurrencies(true))
      };
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden key={AC.FUNDING_AMOUNT_ID} />];
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.AMOUNT}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={false} key={AC.AMOUNT}
          dataFormat={this.props.formatAmount} >{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE} key={AC.CURRENCY_CODE}
          editable={{ type: 'select', options: { values: this.getListOfCurrencies(false) } }}
          dataFormat={this.props.formatCurrency} >{translate('Currency')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.FUNDING_DATE}`)) {
        // TODO: Add a datepicker component.
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable key={AC.FUNDING_DATE}
          dataFormat={this.props.formatDate} >{translate('Date')}</TableHeaderColumn>);
      }
      return (<div>
        <span><label htmlFor="ppc_table" >{translate('Proposed Project Cost')}</label></span>
        <BootstrapTable
          options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} cellEdit={cellEdit} hover
          data={this.props.activity[AC.PPC_AMOUNT]} >
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}
