/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
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
export default class AFProposedProjectCostTable extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

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

  render() {
    if (this.props.activity[AC.PPC_AMOUNT]) {
      /* IMPORTANT: Since we want to mimic the AF that shows inputs on tables not only when the user clicks the
       cell, then is easier to set editable={false} and use our AFField components inside dateFormat, this way
       we dont need to have a fake input for displaying and then extra code for editing (plus many other advantages). */
      const columns = [<TableHeaderColumn dataField={AC.FUNDING_AMOUNT_ID} isKey hidden key={AC.FUNDING_AMOUNT_ID} />];
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.AMOUNT}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.AMOUNT} editable={false} key={AC.AMOUNT}
          dataFormat={() => (<AFField
            parent={this.props.activity[AC.PPC_AMOUNT][0]}
            fieldPath={`${AC.PPC_AMOUNT}~${AC.AMOUNT}`}
            type={Types.NUMBER} showLabel={false} readonly />)} >{translate('Amount')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`)) {
        columns.push(<TableHeaderColumn
          dataField={AC.CURRENCY_CODE} key={AC.CURRENCY_CODE}
          editable={false}
          dataFormat={() => (<AFField
            parent={this.props.activity[AC.PPC_AMOUNT][0]}
            fieldPath={`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`}
            type={Types.DROPDOWN} showLabel={false} />)} >{translate('Currency')}</TableHeaderColumn>);
      }
      if (this.context.activityFieldsManager.isFieldPathEnabled(`${AC.PPC_AMOUNT}~${AC.FUNDING_DATE}`)) {
        // TODO: Add a datepicker component that respects the same format the activity has on ppc.
        columns.push(<TableHeaderColumn
          dataField={AC.FUNDING_DATE} editable={false} key={AC.FUNDING_DATE}
          dataFormat={() => (<AFField
            parent={this.props.activity[AC.PPC_AMOUNT][0]}
            fieldPath={`${AC.PPC_AMOUNT}~${AC.FUNDING_DATE}`}
            type={Types.DATE} showLabel={false} />)} >{translate('Date')}</TableHeaderColumn>);
      }
      return (<div>
        <span><label htmlFor="ppc_table" >{translate('Proposed Project Cost')}</label></span>
        <BootstrapTable
          options={this.options} containerClass={styles.containerTable} tableHeaderClass={styles.header}
          thClassName={styles.thClassName} hover data={this.props.activity[AC.PPC_AMOUNT]} >
          {columns}
        </BootstrapTable>
      </div>);
    }
    return null;
  }
}