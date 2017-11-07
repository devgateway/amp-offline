import React, { Component, PropTypes } from 'react';
import Section from './Section';
import styles from '../ActivityPreview.css';
import * as AC from '../../../../utils/constants/ActivityConstants';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';
import NumberUtils from '../../../../utils/NumberUtils';
import DateUtils from '../../../../utils/DateUtils';

const logger = new Logger('AP project cost');

/**
 * Activity Preview Proposed Project Cost section
 * @author Nadejda Mandrescu
 */
const APProjectCost = (fieldName) => class extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  getFieldValue(fieldPath) {
    // apparently you can disable Amount in FM... but probably this is unrealistic to happen
    if (this.props.activityFieldsManager.isFieldPathEnabled(fieldPath)) {
      return this.props.activityFieldsManager.getValue(this.props.activity, fieldPath);
    }
    return null;
  }

  render() {
    let content = null;
    if (this.props.activityFieldsManager.isFieldPathEnabled(fieldName) === true) {
      const currency = this.props.activityFundingTotals._currentWorkspaceSettings.currency.code;
      const date = this.getFieldValue(`${fieldName}~${AC.FUNDING_DATE}`);
      let amount = 0;
      if (this.props.activity[AC.PPC_AMOUNT] && this.props.activity[AC.PPC_AMOUNT][0]) {
        const ppcAsFunding = this.props.activity[AC.PPC_AMOUNT][0];
        ppcAsFunding[AC.CURRENCY] = ppcAsFunding[AC.CURRENCY_CODE];
        ppcAsFunding[AC.TRANSACTION_AMOUNT] = ppcAsFunding[AC.AMOUNT];
        if (ppcAsFunding[AC.CURRENCY] && ppcAsFunding[AC.TRANSACTION_AMOUNT]) {
          amount = this.props.activityFundingTotals
            ._currencyRatesManager.convertTransactionAmountToCurrency(ppcAsFunding, currency);
          amount = NumberUtils.rawNumberToFormattedString(amount);
        }
      }
      if (this.props.activity.fundings && this.props.activity.fundings.length > 0) {
        content = (<div>
          <div className={styles.project_cost_left}>
            <span className={styles.project_cost_title}>{translate('Cost')} </span>
            <span className={styles.project_cost_currency}>{amount} {currency}</span>
          </div>
          <div className={styles.project_cost_right}>
            <span className={styles.project_cost_title}>{translate('Date')}</span>
            <span className={styles.project_cost_date}>{DateUtils.createFormattedDate(date)}</span>
          </div>
        </div>);
      } else {
        content = (<div>
          <div className={styles.project_cost_left}>
            <span className={styles.project_cost_title}>{translate('Cost')} </span>
            <span className={styles.project_cost_date}>{translate('No Data')}</span>
          </div>
          <div className={styles.project_cost_right}>
            <span className={styles.project_cost_title}>{translate('Date')}</span>
            <span className={styles.project_cost_date}>{translate('No Data')}</span>
          </div>
        </div>);
      }
    }
    return content;
  }
};

export const APProposedProjectCost = Section(APProjectCost(AC.PPC_AMOUNT), 'Proposed Project Cost');
export const APRevisedProjectCost = Section(APProjectCost(AC.RPC_AMOUNT), 'Revised Project Cost');
