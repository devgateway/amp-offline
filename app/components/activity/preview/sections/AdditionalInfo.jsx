import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APField from '../components/APField';
import * as AC from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import DateUtils from '../../../../utils/DateUtils';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import PossibleValuesManager from '../../../../modules/activity/PossibleValuesManager';

/**
 * Additional Info summary section
 * @author Nadejda Mandrecsu
 */
class AdditionalInfo extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityWorkspace: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _getWorkspaceLeadData() {
    let wsLead = this.props.activityWorkspace['workspace-lead-id'];
    if (wsLead) {
      const options = this.props.activityFieldsManager.possibleValuesMap[AC.CREATED_BY];
      const option = PossibleValuesManager.findOption(options, wsLead);
      wsLead = option ? option.value : wsLead;
    }
    return wsLead;
  }

  _buildAdditionalInfo() {
    const additionalInfo = [];
    const teamName = this.props.activityFieldsManager.getValueTranslation(AC.TEAM, this.props.activityWorkspace.name);
    // no need to export repeating translation for the access type through workspaces EP
    const accessType = translate(this.props.activityWorkspace['access-type']);
    const isComputedTeam = this.props.activityWorkspace['is-computed'] === true ? translate('Yes') : translate('No');
    const updatedOn = this.props.activity[AC.CLIENT_UPDATED_ON] || this.props.activity[AC.MODIFIED_ON];
    const createdBy = this.props.activity[AC.CREATED_BY];

    additionalInfo.push(APField.instance('activityCreatedBy', createdBy ? createdBy.value : null));
    additionalInfo.push(APField.instance('createdInWorkspace', `${teamName} - ${accessType}`));
    additionalInfo.push(APField.instance('computation', isComputedTeam));

    const createdOn = this.props.activity[AC.CREATED_ON] || this.props.activity[AC.CLIENT_CREATED_ON];
    additionalInfo.push(APField.instance('activityCreatedOn', DateUtils.createFormattedDate(createdOn)));

    if (updatedOn && (this.props.activityFieldsManager.isFieldPathEnabled(AC.CLIENT_UPDATED_ON)
      || this.props.activityFieldsManager.isFieldPathEnabled(AC.MODIFIED_ON))) {
      additionalInfo.push(APField.instance('activityUpdatedOn', DateUtils.createFormattedDate(updatedOn)));
    }
    additionalInfo.push(APField.instance('dataTeamLeader', this._getWorkspaceLeadData()));

    return additionalInfo;
  }

  render() {
    return <div>{this._buildAdditionalInfo()}</div>;
  }

}

export default Section(AdditionalInfo, 'additionalInfo');
