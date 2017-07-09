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
    activity: PropTypes.object.isRequired,
    formatAmount: PropTypes.func.isRequired, // TODO: remove this functions, are too generic.
    formatDate: PropTypes.func.isRequired
  };

  static onAfterSaveCell() {
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.options = {
      withoutNoDataText: true
    };
  }

  render() {
    if (this.props.activity[AC.PPC_AMOUNT]) {
      // TODO: If using editable={false} + using our components on dataFormat --> remove cellEdit and add a comment.
      const cellEdit = {
        mode: 'click',
        blurToSave: true,
        afterSaveCell: AFProposedProjectCostTable.onAfterSaveCell.bind(this)
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
          editable={false}
          dataFormat={() => (<AFField
            parent={this.props.activity[AC.PPC_AMOUNT][0]}
            fieldPath={`${AC.PPC_AMOUNT}~${AC.CURRENCY_CODE}`}
            type={Types.DROPDOWN} showLabel={false} />)} >{translate('Currency')}</TableHeaderColumn>);
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
