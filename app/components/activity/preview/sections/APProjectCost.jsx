import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants } from 'amp-ui';
import Section from './Section';
import styles from '../ActivityPreview.css';
import FieldsManager from '../../../../modules/field/FieldsManager';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';
import NumberUtils from '../../../../utils/NumberUtils';
import DateUtils from '../../../../utils/DateUtils';
import PossibleValuesManager from '../../../../modules/field/PossibleValuesManager';

const logger = new Logger('AP project cost');

/**
 * Activity Preview Proposed Project Cost section
 * @author Nadejda Mandrescu
 */
const APProjectCost = (fieldName) => class extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activityFundingTotals: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  getFieldValue(fieldPath) {
    // apparently you can disable Amount in FM... but probably this is unrealistic to happen
    if (this.props.activityFieldsManager.isFieldPathEnabled(fieldPath)) {
      return this.props.activityFieldsManager.getValue(this.props.activity, fieldPath,
        PossibleValuesManager.getOptionTranslation);
    }
    return null;
  }

  render() {
    let content = null;
    if (this.props.activityFieldsManager.isFieldPathEnabled(fieldName) === true) {
      const currency = this.props.activityFundingTotals._currentWorkspaceSettings.currency.code;
      let amount = 0;
      let showPPC = false;
      const ppcAsFunding = this.props.activity[ActivityConstants.PPC_AMOUNT];
      if (ppcAsFunding && ppcAsFunding[ActivityConstants.AMOUNT] && ppcAsFunding[ActivityConstants.CURRENCY]) {
        showPPC = true;
        ppcAsFunding[ActivityConstants.CURRENCY] = ppcAsFunding[ActivityConstants.CURRENCY];
        ppcAsFunding[ActivityConstants.TRANSACTION_AMOUNT] = ppcAsFunding[ActivityConstants.AMOUNT];
        if (ppcAsFunding[ActivityConstants.CURRENCY] && ppcAsFunding[ActivityConstants.TRANSACTION_AMOUNT]) {
          amount = this.props.activityFundingTotals
            ._currencyRatesManager.convertTransactionAmountToCurrency(ppcAsFunding, currency);
          amount = NumberUtils.rawNumberToFormattedString(amount);
        }
      }
      if (showPPC) {
        let date = this.getFieldValue(`${fieldName}~${ActivityConstants.FUNDING_DATE}`);
        date = date ? DateUtils.createFormattedDate(date) : translate('No Data');
        content = (<div>
          <div className={styles.project_cost_left}>
            <span className={styles.project_cost_title}>{translate('Cost')} </span>
            <span className={styles.project_cost_currency}>{amount} {currency}</span>
          </div>
          <div className={styles.project_cost_right}>
            <span className={styles.project_cost_title}>{translate('Date')}</span>
            <span className={styles.project_cost_date}>{date}</span>
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

export const APProposedProjectCost = Section(APProjectCost(ActivityConstants.PPC_AMOUNT), 'Proposed Project Cost');
export const APRevisedProjectCost = Section(APProjectCost(ActivityConstants.RPC_AMOUNT), 'Revised Project Cost');
