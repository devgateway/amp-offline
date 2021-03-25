import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ActivityPreviewUI,
  CurrencyRatesManager,
  FieldsManager,
  WorkspaceConstants,
  UserConstants,
  GlobalSettingsConstants
} from 'amp-ui';
import translate from '../../../utils/translate';
import ActivityFundingTotals from '../../../modules/activity/ActivityFundingTotals';
import Logger from '../../../modules/util/LoggerManager';
import DesktopManager from '../../../modules/desktop/DesktopManager';
import DateUtils from '../../../utils/DateUtils';
import { getActivityContactIds } from '../../../actions/ContactAction';
import { APDocumentPage } from '../../../containers/ResourcePage';

const logger = new Logger('Activity preview');

/**
 * Activity Preview main container
 * @author Nadejda Mandrescu
 */
export default class ActivityPreview extends Component {

  static propTypes = {
    activityReducer: PropTypes.shape({
      isActivityLoading: PropTypes.bool,
      isActivityLoaded: PropTypes.bool,
      activity: PropTypes.object,
      activityWorkspace: PropTypes.object,
      activityWSManager: PropTypes.object,
      activityFieldsManager: PropTypes.instanceOf(FieldsManager),
      activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
      currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
      currentWorkspaceSettings: PropTypes.object,
      errorMessage: PropTypes.object
    }).isRequired,
    contactReducer: PropTypes.shape({
      contactFieldsManager: PropTypes.instanceOf(FieldsManager),
      contactsByIds: PropTypes.object,
    }).isRequired,
    resourceReducer: PropTypes.object.isRequired,
    loadActivityForActivityPreview: PropTypes.func.isRequired,
    unloadActivity: PropTypes.func.isRequired,
    params: PropTypes.shape({
      activityId: PropTypes.string.isRequired
    }).isRequired,
    workspaceReducer: PropTypes.object,
    userReducer: PropTypes.object,
    startUpReducer: PropTypes.object
  };

  static childContextTypes = {
    activity: PropTypes.object,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager),
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals),
    contactFieldsManager: PropTypes.instanceOf(FieldsManager),
    contactsByIds: PropTypes.object,
    resourceReducer: PropTypes.object,
    calendar: PropTypes.object,
    Logger: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    DateUtils: PropTypes.func.isRequired,
    getActivityContactIds: PropTypes.func.isRequired,
    APDocumentPage: PropTypes.func.isRequired,
    globalSettings: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  getChildContext() {
    return {
      activityFieldsManager: this.props.activityReducer.activityFieldsManager,
      contactFieldsManager: this.props.contactReducer.contactFieldsManager,
      contactsByIds: this.props.contactReducer.contactsByIds,
      activityFundingTotals: this.props.activityReducer.activityFundingTotals,
      currencyRatesManager: this.props.activityReducer.currencyRatesManager,
      resourceReducer: this.props.resourceReducer,
      Logger,
      translate,
      DateUtils,
      getActivityContactIds,
      APDocumentPage
    };
  }

  componentWillMount() {
    this.props.loadActivityForActivityPreview(this.props.params.activityId);
  }

  componentWillUnmount() {
    this.props.unloadActivity();
  }
  _getMessage() {
    const { activityReducer } = this.props;
    let message = null;
    if (activityReducer.isActivityLoading === true) {
      message = translate('activityLoading');
    } else if (activityReducer.isActivityLoaded === true) {
      if (!activityReducer.activity) {
        message = translate('activityUnexpectedError');
      }
    } else if (activityReducer.errorMessage) {
      message = `${activityReducer.errorMessage}`;
    }
    if (message !== null) {
      message = <h1>{message}</h1>;
    }
    return message;
  }

  generateActivityContext() {
    const { activity, activityWSManager, currentWorkspaceSettings } = this.props.activityReducer;
    const { startUpReducer, userReducer, workspaceReducer, activityReducer } = this.props;
    const activityContext = {
      canEditActivities: true,
      activityStatus: activity ? DesktopManager.getActivityStatus(activity) : null,
      teamMember: {
        teamMemberRole: userReducer.teamMember[WorkspaceConstants.ROLE_ID],
        workspace: {
          [WorkspaceConstants.ACCESS_TYPE]: workspaceReducer.currentWorkspace[WorkspaceConstants.ACCESS_TYPE],
          [WorkspaceConstants.IS_COMPUTED]: workspaceReducer.currentWorkspace[WorkspaceConstants.IS_COMPUTED],
          // eslint-disable-next-line max-len
          [WorkspaceConstants.CROSS_TEAM_VALIDATION]: workspaceReducer.currentWorkspace[WorkspaceConstants.CROSS_TEAM_VALIDATION],
          [WorkspaceConstants.IS_PRIVATE]: workspaceReducer.currentWorkspace[WorkspaceConstants.IS_PRIVATE],
          id: workspaceReducer.currentWorkspace.id,
          prefix: workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]
        },
      },
      calendar: startUpReducer.calendar,
      activityWorkspace: activityReducer.activityWorkspace,
      // eslint-disable-next-line max-len
      workspaceLeadData: activityWSManager ? `${activityWSManager[UserConstants.FIRST_NAME]} ${activityWSManager[UserConstants.LAST_NAME]} ${activityWSManager[UserConstants.EMAIL]}` : null,
      effectiveCurrency: currentWorkspaceSettings ? currentWorkspaceSettings.currency.code : null,
      reorderFundingItemId: Number(startUpReducer.globalSettings[GlobalSettingsConstants.REORDER_FUNDING_ITEMS]),
      versionHistoryInformation: {
        showVersionHistory: false
      }
    };
    return activityContext;
  }

  render() {
    const message = this._getMessage();
    const { activity } = this.props.activityReducer;

    if (message) {
      return (<div >{message} </div>);
    } else {
      const activityContext = this.generateActivityContext();
      return (<ActivityPreviewUI activity={activity} activityContext={activityContext} />);
    }
  }
}
