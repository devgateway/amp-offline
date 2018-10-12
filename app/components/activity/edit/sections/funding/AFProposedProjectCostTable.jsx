/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from '../../components/AFList.css';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import * as FPC from '../../../../../utils/constants/FieldPathConstants';

const logger = new Logger('AF proposed project cost table');

/**
 * @author Gabriel Inchauspe
 */
export default class AFProposedProjectCostTable extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    currentWorkspaceSettings: PropTypes.object.isRequired,
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  _createCurrencyField() {
    if (!this.context.activity[AC.PPC_AMOUNT][0][AC.CURRENCY_CODE] ||
      !this.context.activity[AC.PPC_AMOUNT][0][AC.CURRENCY_CODE].id) {
      const currency = Object.values(this.context.activityFieldsManager.possibleValuesMap[FPC.FUNDING_CURRENCY_PATH])
        .find(pv => pv.value === this.context.currentWorkspaceSettings.currency.code);
      // TODO: Check why the structure of this object is {id: currecy_code, value: currency_code}.
      const newCurrency = { id: currency.value, value: currency.value };
      this.context.activity[AC.PPC_AMOUNT][0][AC.CURRENCY_CODE] = newCurrency;
    }
    const field = (<AFField
      parent={this.context.activity[AC.PPC_AMOUNT][0]}
      fieldPath={`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`}
      type={Types.DROPDOWN} showLabel={false} extraParams={{ noChooseOneOption: true, showOrigValue: true }} />);
    return field;
  }

  render() {
    if (this.context.activityFieldsManager.isFieldPathEnabled(AC.PPC_AMOUNT)) {
      /* IMPORTANT: Since we want to mimic the AF that shows inputs on tables not only when the user clicks the
       cell, then is easier to set editable={false} and use our AFField components inside dateFormat, this way
       we dont need to have a fake input for displaying and then extra code for editing (plus many other advantages). */
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden key={AC.FUNDING_AMOUNT_ID} />];
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.AMOUNT}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={false} key={AC.AMOUNT}
          dataFormat={() => (<AFField
            parent={this.context.activity[AC.PPC_AMOUNT][0]}
            fieldPath={`${AC.PPC_AMOUNT}~${AC.AMOUNT}`}
            type={Types.NUMBER} showLabel={false} readonly />)} >{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE} key={AC.CURRENCY_CODE}
          editable={false}
          dataFormat={() => (this._createCurrencyField())} >{translate('Currency')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.FUNDING_DATE}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable={false} key={AC.FUNDING_DATE}
          dataFormat={() => (<AFField
            parent={this.context.activity[AC.PPC_AMOUNT][0]}
            fieldPath={`${AC.PPC_AMOUNT}~${AC.FUNDING_DATE}`}
            type={Types.DATE} showLabel={false} />)} >{translate('Date')}</TableHeaderColumn>);
      }
      // Create empty row for new activities.
      this.context.activity[AC.PPC_AMOUNT] = this.context.activity[AC.PPC_AMOUNT]
        || [{ [AC.AMOUNT]: null,
          [AC.CURRENCY_CODE]: this.context.currentWorkspaceSettings.currency.code,
          [AC.FUNDING_DATE]: null }];
      return (<div>
        <span><label htmlFor="ppc_table" >{translate('Proposed Project Cost')}</label></span>
        <BootstrapTable
          options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} hover data={this.context.activity[AC.PPC_AMOUNT]} >
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}
