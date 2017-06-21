/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import * as AF from '../../components/AFComponentTypes';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import AFField from '../../components/AFField';
import AFOverallFundingTotals from './AFOverallFundingTotals';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import AFProposedProjectCostTable from './AFProposedProjectCostTable';
import AFRevisedProjectCostTable from './AFRevisedProjectCostTable';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import NumberUtils from '../../../../../utils/NumberUtils';
import styles from '../../components/AFList.css';
import AFPPCAnnualBudgets from './AFPPCAnnualBudgets';

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

  static getFormattedAmountCell(cell) {
    return (<span className={styles.editable}>{NumberUtils.rawNumberToFormattedString(cell, true)}</span>);
  }

  static getFormattedDateCell(cell) {
    return (<span className={styles.editable}>{createFormattedDate(cell)}</span>);
  }

  static getCurrencyCode(cell) {
    return `<span class=${styles.editable}>${cell.value || cell}</span>`; // Notice the `` for editable cell.
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    // TODO: implement number field for 'total_number_of_funding_sources'.
    return (<div>
      <AFProposedProjectCostTable
        activity={this.props.activity} formatAmount={AFProjectCost.getFormattedAmountCell}
        formatDate={AFProjectCost.getFormattedDateCell} formatCurrency={AFProjectCost.getCurrencyCode} />
      <AFPPCAnnualBudgets
        activity={this.props.activity} formatAmount={AFProjectCost.getFormattedAmountCell}
        formatCurrency={AFProjectCost.getCurrencyCode} />
      <AFRevisedProjectCostTable
        activity={this.props.activity} formatAmount={AFProjectCost.getFormattedAmountCell}
        formatDate={AFProjectCost.getFormattedDateCell} formatCurrency={AFProjectCost.getCurrencyCode} />
      <AFField parent={this.props.activity} fieldPath={AC.TOTAL_NUMBER_OF_FUNDING_SOURCES} type={AF.NUMBER} />
      <AFField parent={this.props.activity} fieldPath={AC.TYPE_OF_COOPERATION} />
      <AFField parent={this.props.activity} fieldPath={AC.TYPE_OF_IMPLEMENTATION} />
      <AFField parent={this.props.activity} fieldPath={AC.MODALITIES} />
      <AFOverallFundingTotals activity={this.props.activity} />
    </div>);
  }
}
