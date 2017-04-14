import React, { Component, PropTypes } from 'react';
import styles from './ActivityPreview.css';
import SectionGroup from './sections/SectionGroup';
import APField from './components/APField';
import * as AC from '../../../utils/constants/ActivityConstants';
import * as VC from '../../../utils/constants/ValueConstants';
import * as PC from '../../../utils/constants/FieldPathConstants';
import ActivityFieldsManager from '../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import translate from '../../../utils/translate';
import LoggerManager from '../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * Activty summary information
 * @author Nadejda Mandrescu
 */
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

  /**
   * Builds "Funding Information" section by following AMP Activity Preview rules
   * @return {SectionGroup}
   * @private
   */
  _buildFundingInformation() {
    const measuresOrder = [VC.ACTUAL_COMMITMENTS, VC.PLANNED_COMMITMENTS, VC.ACTUAL_DISBURSEMENTS,
      VC.PLANNED_DISBURSEMENTS, VC.ACTUAL_EXPENDITURES, VC.UNALLOCATED_DISBURSEMENTS, VC.PLANNED_EXPENDITURES];
    const measuresTotals = {};
    // TODO update how we detect that a transaction type is enabled once AMP-25787 is done
    // Commitments, Disbursements, Expenditures
    VC.TRANSACTION_TYPES.forEach(trnType => {
      // checking if this transaction type is provided as an option, through a trick by detecting the translation
      const trnTypeTrn = this.context.activityFieldsManager.getValueTranslation(PC.TRANSACTION_TYPE_PATH, trnType);
      VC.ADJUSTMENT_TYPES.forEach(adjType => {
        const adjTypeTrn = this.context.activityFieldsManager.getValueTranslation(PC.ADJUSTMENT_TYPE_PATH, adjType);
        if (adjTypeTrn && trnTypeTrn) {
          const value = this.context.activityFundingTotals.getTotals(adjTypeTrn, trnTypeTrn, {});
          measuresTotals[`${adjType} ${trnType}`] = value;
        }
      });
    });
    // Other measures
    const adjTypeActualTrn = this.context.activityFieldsManager.getValueTranslation(PC.ADJUSTMENT_TYPE_PATH, VC.ACTUAL);
    if (adjTypeActualTrn) {
      const ub = VC.UNALLOCATED_DISBURSEMENTS;
      measuresTotals[ub] = this.context.activityFundingTotals.getTotals(ub, {});
    }

    // TODO: update with current WS currency
    const currency = 'USD';
    const fundingInfoSummaryTitle = `${(translate('fundingInformation'))} ${currency}`;
    return (
      <SectionGroup key={'fundingInformation'} title={fundingInfoSummaryTitle}>
        {this._buildTotalFields(measuresOrder, measuresTotals)}
      </SectionGroup>);
  }

  _buildTotalFields(measuresOrder, measuresTotals) {
    const fundingInfoSummary = [];
    const totalTrn = translate('Total');
    measuresOrder.forEach(measure => {
      const value = measuresTotals[measure];
      if (value !== undefined) {
        const title = `${totalTrn} ${translate(measure)}`;
        const key = `Summary-Total-${measure}`;
        fundingInfoSummary.push(<APField key={key} title={title} value={value} />);
      }
    });
    return fundingInfoSummary;
  }

  _buildAdditionalInfo() {
    const additionalInfo = [];
    // TODO once translations available for workspace name AMP-25766
    const teamName = this.context.activityWorkspace.name;
    // no need to export repeating translation for the access type through workspaces EP
    const accessType = translate(this.context.activityWorkspace['access-type']);
    const isComputedTeam = this.context.activityWorkspace['is-computed'] === true ? translate('Yes') : translate('No');
    // TODO dates formatting AMPOFFLINE-129
    const updatedOn = this.context.activity[AC.MODIFIED_ON];

    // TODO update once possible values are available for it AMP-25680
    additionalInfo.push(APField.instance('activityCreatedBy', this.context.activity[AC.CREATED_BY]));
    additionalInfo.push(APField.instance('createdInWorkspace', `${teamName} - ${accessType}`));
    additionalInfo.push(APField.instance('computation', isComputedTeam));
    // TODO update dates formatting AMPOFFLINE-129
    additionalInfo.push(APField.instance('activityCreatedOn', this.context.activity[AC.CREATED_ON]));
    // TODO check if updated on can be displayed by ActivityPreview FM once AMPOFFLINE-309 is done
    if (updatedOn) {
      additionalInfo.push(APField.instance('activityUpdatedOn', updatedOn));
    }
    additionalInfo.push(APField.instance('dataTeamLeader', this._getWorkspaceLeadData()));

    return SectionGroup.instance('additionalInfo', additionalInfo);
  }

  _getWorkspaceLeadData() {
    // TODO update once possible options for team members are available AMP-25680
    return this.context.activityWorkspace['workspace-lead-id'];
  }

  render() {
    return (<div className={styles.section_group}>
      {this._buildFundingInformation()}
      {this._buildAdditionalInfo()}
    </div>);
  }

}
