import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APField from '../components/APField';
import * as AC from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import DateUtils from '../../../../utils/DateUtils';

/**
 * Additional Info summary section
 * @author Nadejda Mandrecsu
 */
class AdditionalInfo extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityWorkspace: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  _getWorkspaceLeadData() {
    // TODO update once possible options for team members are available AMP-25680
    return this.props.activityWorkspace['workspace-lead-id'];
  }

  _buildAdditionalInfo() {
    const additionalInfo = [];
    // TODO once translations available for workspace name AMP-25766
    const teamName = this.props.activityWorkspace.name;
    // no need to export repeating translation for the access type through workspaces EP
    const accessType = translate(this.props.activityWorkspace['access-type']);
    const isComputedTeam = this.props.activityWorkspace['is-computed'] === true ? translate('Yes') : translate('No');
    // TODO dates formatting AMPOFFLINE-129
    const updatedOn = this.props.activity[AC.CLIENT_UPDATED_ON] || this.props.activity[AC.MODIFIED_ON];

    // TODO update once possible values are available for it AMP-25680
    additionalInfo.push(APField.instance('activityCreatedBy', this.props.activity[AC.CREATED_BY]).value);
    additionalInfo.push(APField.instance('createdInWorkspace', `${teamName} - ${accessType}`));
    additionalInfo.push(APField.instance('computation', isComputedTeam));
    // TODO update dates formatting AMPOFFLINE-129
    
    const createdOn = this.props.activity[AC.CREATED_ON] || this.props.activity[AC.CLIENT_CREATED_ON];
    additionalInfo.push(APField.instance('activityCreatedOn', DateUtils.createFormattedDate(createdOn)));

    // TODO check if updated on can be displayed by ActivityPreview FM once AMPOFFLINE-309 is done
    if (updatedOn) {
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
