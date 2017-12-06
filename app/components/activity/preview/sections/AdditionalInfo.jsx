import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APField from '../components/APField';
import * as AC from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import PossibleValuesManager from '../../../../modules/activity/PossibleValuesManager';

const logger = new Logger('AP Additional info');

/**
 * Additional Info summary section
 * @author Nadejda Mandrecsu
 */
class AdditionalInfo extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityWorkspace: PropTypes.object.isRequired,
    buildSimpleField: PropTypes.func.isRequired,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
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
    const teamName = this.props.activityFieldsManager.getValue(this.props.activity, AC.TEAM);
    // no need to export repeating translation for the access type through workspaces EP
    const accessType = translate(this.props.activityWorkspace['access-type']);
    const isComputedTeam = this.props.activityWorkspace['is-computed'] === true ? translate('Yes') : translate('No');

    // TODO: the right value as defined in AMP-25403 will be shown after AMP-26295.
    additionalInfo.push(this.props.buildSimpleField(AC.CREATED_BY, true));
    additionalInfo.push(this.props.buildSimpleField(AC.CREATED_ON, true));
    additionalInfo.push(this.props.buildSimpleField(AC.MODIFIED_BY, true));
    additionalInfo.push(this.props.buildSimpleField(AC.MODIFIED_ON, true));
    additionalInfo.push(APField.instance('createdInWorkspace', `${teamName} - ${accessType}`,
      false, false, this.props.fieldNameClass, this.props.fieldValueClass));

    // TODO: the right value as defined in AMP-25403 will be shown after AMP-26295.
    additionalInfo.push(APField.instance('workspaceManager', this._getWorkspaceLeadData(),
      false, false, this.props.fieldNameClass, this.props.fieldValueClass));

    additionalInfo.push(APField.instance('computation', isComputedTeam,
      false, false, this.props.fieldNameClass, this.props.fieldValueClass));

    return additionalInfo;
  }

  render() {
    return <div>{this._buildAdditionalInfo()}</div>;
  }

}

export default Section(AdditionalInfo, 'additionalInfo');
