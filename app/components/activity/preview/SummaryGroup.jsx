import React, { Component, PropTypes } from 'react';
import styles from './ActivityPreview.css';
import SectionGroup from './SectionGroup';
import SimpleField from './SimpleField';
import * as AC from '../../../utils/constants/ActivityConstants';
import * as VC from '../../../utils/constants/ValueConstants';
import * as PC from '../../../utils/constants/FieldPathConstants';
import * as TC from '../../../utils/constants/TranslationConstants';
import ActivityFieldsManager from '../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import translate from '../../../utils/translate';

export default class SummaryGroup extends Component {
  static propTypes = {
    activityReducer: {
      activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
      activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired
    }
  };

  constructor(props) {
    super(props);
    console.log('constructor');
  }

  _buildFundingInformation() {
    const fundingInfoSummary = [];
    const actFieldsManager = this.props.activityReducer.activityFieldsManager;
    const actualTrn = actFieldsManager.getTranslation(PC.ADJUSTMENT_TYPE_PATH, VC.ACTUAL);
    const plannedTrn = actFieldsManager.getTranslation(PC.ADJUSTMENT_TYPE_PATH, VC.PLANNED);
    const commTrn = actFieldsManager.getTranslation(PC.TRANSACTION_TYPE_PATH, VC.COMMITMENTS);
    const disbTrn = actFieldsManager.getTranslation(PC.TRANSACTION_TYPE_PATH, VC.DISBURSEMENTS);
    const totalTrn = translate(TC.TOTAL);
    const combinations = [[actualTrn, commTrn], [plannedTrn, commTrn], [actualTrn, disbTrn], [plannedTrn, disbTrn]];
    combinations.forEach(([adjType, trnType]) => {
      if (adjType && trnType) {
        const value = this.props.activityReducer.activityFundingTotals.getTotals(adjType, trnType, {});
        const title = `${totalTrn} ${adjType} ${trnType}`;
        fundingInfoSummary.push(<SimpleField title={title} value={value} />);
      }
    });
    // TODO: update with current WS currency
    const currency = 'USD';
    const fundingInfoSummaryTitle = `${(translate(TC.FUNDING_INFORMATION))} ${currency}`;
    return <SectionGroup title={fundingInfoSummaryTitle} simpleFields={fundingInfoSummary} />;
  }

  render() {
    const fundingInfoSummary = this._buildFundingInformation();
    return (<div>
      {fundingInfoSummary}
    </div>);
  }

}
