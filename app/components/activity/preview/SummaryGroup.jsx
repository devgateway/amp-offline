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
import LoggerManager from '../../../modules/util/LoggerManager';

export default class SummaryGroup extends Component {
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityWorkspace: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
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
          const key = `Summary-Total-${adjType}-${trnType}`;
          fundingInfoSummary.push(<SimpleField key={key} title={title} value={value} />);
        }
      });
    });
    // TODO add all other funding totals

    // TODO: update with current WS currency
    const currency = 'USD';
    const fundingInfoSummaryTitle = `${(translate(TC.FUNDING_INFORMATION))} ${currency}`;
    return (
      <SectionGroup key={TC.FUNDING_INFORMATION} title={fundingInfoSummaryTitle}>
        {fundingInfoSummary}
      </SectionGroup>);
  }

  _buildAdditionalInfo() {
    const additionalInfo = [];
    // TODO once translations available for workspace name AMP-25766
    const teamName = this.context.activityWorkspace.name;
    const isComputedTeam = this.context.activityWorkspace['is-computed'] === true ? translate('yes') : translate('no');
    const updatedOn = this.context.activity[AC.MODIFIED_ON];

    // TODO update once possible values are available for it
    additionalInfo.push(SimpleField.instance('activityCreatedBy', this.context.activity[AC.CREATED_BY]));
    additionalInfo.push(SimpleField.instance('createdInWorkspace', `${teamName} - ${this._getAccessType()}`));
    additionalInfo.push(SimpleField.instance('computation', isComputedTeam));
    additionalInfo.push(SimpleField.instance('activityCreatedOn', this.context.activity[AC.CREATED_ON]));
    // TODO check if updated on can be displayed by ActivityPreview FM
    if (updatedOn) {
      additionalInfo.push(SimpleField.instance('activityUpdatedOn', updatedOn));
    }
    additionalInfo.push(SimpleField.instance('dataTeamLeader', this._getWorkspaceLeadData()));

    return SectionGroup.instance('additionalInfo', additionalInfo);
  }

  _getWorkspaceLeadData() {
    // TODO update once full lead data is provided here AMP-25766
    return this.context.activityWorkspace['workspace-lead-id'];
  }

  _getAccessType() {
    // no need to export repeating translation for the access type through workspaces EP
    const accessType = this.context.activityWorkspace['access-type'];
    if (accessType === 'Team') {
      return translate('team');
    } else if (accessType === 'Management') {
      return translate('management');
    }
    return accessType;
  }

  render() {
    return (<div className={styles.section_group}>
      {this._buildFundingInformation()}
      {this._buildAdditionalInfo()}
    </div>);
  }

}
