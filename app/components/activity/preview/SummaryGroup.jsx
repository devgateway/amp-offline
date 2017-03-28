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
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityWorkspace: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired
  };

  constructor(props) {
    super(props);
    console.log('constructor');
  }

  _buildFundingInformation() {
    const fundingInfoSummary = [];
    const totalTrn = translate(TC.TOTAL);
    VC.TRANSACTION_TYPES.forEach(trnType => {
      const trnTypeTrn = this.context.activityFieldsManager.getTranslation(PC.TRANSACTION_TYPE_PATH, trnType);
      VC.ADJUSTMENT_TYPES.forEach(adjType => {
        const adjTypeTrn = this.context.activityFieldsManager.getTranslation(PC.ADJUSTMENT_TYPE_PATH, adjType);
        if (adjTypeTrn && trnTypeTrn) {
          const value = this.context.activityFundingTotals.getTotals(adjTypeTrn, trnTypeTrn, {});
          const title = `${totalTrn} ${adjTypeTrn} ${trnTypeTrn}`;
          fundingInfoSummary.push(<SimpleField title={title} value={value} />);
        }
      });
    });
    // TODO add all other funding totals

    // TODO: update with current WS currency
    const currency = 'USD';
    const fundingInfoSummaryTitle = `${(translate(TC.FUNDING_INFORMATION))} ${currency}`;
    return <SectionGroup title={fundingInfoSummaryTitle} simpleFields={fundingInfoSummary} />;
  }

  _buildAdditionalInfo() {
    const additionalInfo = [];
    // TODO update once possible values are available for it
    const createdBy = this.context.activity[AC.CREATED_BY];
    // TODO update once translations are available for workspace data
    const teamName = this.context.activityWorkspace.name;
    const accessType = this.context.activityWorkspace['access-type'];
    const isComputedTeam = this.context.activityWorkspace['is-computed'] === true ? translate('yes') : translate('no');
    const createdOn = this.context.activity[AC.CREATED_ON];
    const updatedOn = this.context.activity[AC.MODIFIED_ON];

    additionalInfo.push(<SimpleField title={translate('activityCreatedBy')} value={createdBy} />);
    additionalInfo.push(<SimpleField title={translate('createdInWorkspace')} value={`${teamName} - ${accessType}`} />);
    additionalInfo.push(<SimpleField title={translate('computation')} value={isComputedTeam} />);
    additionalInfo.push(<SimpleField title={translate('activityCreatedOn')} value={createdOn} />);
    // TODO check if updated on can be displayed by ActivityPreview FM
    if (updatedOn) {
      additionalInfo.push(<SimpleField title={translate('activityUpdatedOn')} value={updatedOn} />);
    }
    additionalInfo.push(<SimpleField title={translate('dataTeamLeader')} value={this._getWorkspaceLeadData()} />);

    return <SectionGroup title={translate('additionalInfo')} simpleFields={additionalInfo} />;
  }

  _getWorkspaceLeadData() {
    // TODO update once full lead data is provided here
    return this.context.activityWorkspace['workspace-lead-id'];
  }

  render() {
    return (<div className={styles.section_group}>
      {this._buildFundingInformation()}
      {this._buildAdditionalInfo()}
    </div>);
  }

}
