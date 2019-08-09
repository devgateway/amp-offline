/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ActivityConstants, FieldPathConstants } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import translate from '../../../../../utils/translate';
import styles from '../../components/AFList.css';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import AFField from '../../components/AFField';
import * as Types from '../../components/AFComponentTypes';
import CurrencyRatesManager from '../../../../../modules/util/CurrencyRatesManager';
import * as AFUtils from '../../util/AFUtils';

const logger = new Logger('AF proposed project cost table');

/**
 * @author Gabriel Inchauspe
 */
export default class AFProposedProjectCostTable extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    currentWorkspaceSettings: PropTypes.object.isRequired,
    activity: PropTypes.object.isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager).isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  _createCurrencyField() {
    const { activity, activityFieldsManager, currentWorkspaceSettings, currencyRatesManager } = this.context;
    const ppc = activity[ActivityConstants.PPC_AMOUNT];
    if (!ppc[ActivityConstants.CURRENCY] || !ppc[ActivityConstants.CURRENCY].id) {
      const currencies = activityFieldsManager.getPossibleValuesOptions(FieldPathConstants.PPC_CURRENCY_PATH);
      const wsCurrencyCode = currentWorkspaceSettings.currency.code;
      const currency = AFUtils.getDefaultOrFirstUsableCurrency(currencies, wsCurrencyCode, currencyRatesManager);
      ppc[ActivityConstants.CURRENCY] = currency;
    }
    const field = (<AFField
      parent={ppc}
      fieldPath={`${ActivityConstants.PPC_AMOUNT}~${ActivityConstants.CURRENCY}`}
      type={Types.DROPDOWN} showLabel={false} extraParams={{ noChooseOneOption: true, showOrigValue: true }} />);
    return field;
  }

  render() {
    if (this.context.activityFieldsManager.isFieldPathEnabled(ActivityConstants.PPC_AMOUNT)) {
      /* IMPORTANT: Since we want to mimic the AF that shows inputs on tables not only when the user clicks the
       cell, then is easier to set editable={false} and use our AFField components inside dateFormat, this way
       we dont need to have a fake input for displaying and then extra code for editing (plus many other advantages). */
      const columns = [<TableHeaderColumn
        dataField={ActivityConstants.FUNDING_AMOUNT_ID}
        isKey hidden key={ActivityConstants.FUNDING_AMOUNT_ID} />];
      if (this.context.activityFieldsManager
        .isFieldPathEnabled(`${ActivityConstants.PPC_AMOUNT}~${ActivityConstants.AMOUNT}`)) {
        columns.push(<TableHeaderColumn
          dataField={ActivityConstants.AMOUNT} editable={false} key={ActivityConstants.AMOUNT}
          dataFormat={() => (<AFField
            parent={this.context.activity[ActivityConstants.PPC_AMOUNT]}
            fieldPath={`${ActivityConstants.PPC_AMOUNT}~${ActivityConstants.AMOUNT}`}
            type={Types.NUMBER} showLabel={false} readonly />)}>{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager
        .isFieldPathEnabled(`${ActivityConstants.PPC_AMOUNT}~${ActivityConstants.CURRENCY}`)) {
        columns.push(<TableHeaderColumn
          dataField={ActivityConstants.CURRENCY} key={ActivityConstants.CURRENCY}
          editable={false}
          dataFormat={() => (this._createCurrencyField())}>{translate('Currency')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager
        .isFieldPathEnabled(`${ActivityConstants.PPC_AMOUNT}~${ActivityConstants.FUNDING_DATE}`)) {
        columns.push(<TableHeaderColumn
          dataField={ActivityConstants.FUNDING_DATE} editable={false} key={ActivityConstants.FUNDING_DATE}
          dataFormat={() => (<AFField
            parent={this.context.activity[ActivityConstants.PPC_AMOUNT]}
            fieldPath={`${ActivityConstants.PPC_AMOUNT}~${ActivityConstants.FUNDING_DATE}`}
            type={Types.DATE} showLabel={false} />)}>{translate('Date')}</TableHeaderColumn>);
      }
      // Create empty row for new activities.
      this.context.activity[ActivityConstants.PPC_AMOUNT] = this.context.activity[ActivityConstants.PPC_AMOUNT]
        || {
          [ActivityConstants.AMOUNT]: null,
          [ActivityConstants.CURRENCY]: this.context.currentWorkspaceSettings.currency.code,
          [ActivityConstants.FUNDING_DATE]: null
        };
      return (<div>
        <span><label htmlFor="ppc_table">{translate('Proposed Project Cost')}</label></span>
        <BootstrapTable
          options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} hover data={[this.context.activity[ActivityConstants.PPC_AMOUNT]]}>
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}
