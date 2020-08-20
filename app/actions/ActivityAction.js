import { ActivityConstants, Constants, ErrorConstants, ValueConstants, FieldPathConstants
  , FieldsManager, WorkspaceConstants } from 'amp-ui';
import * as ActivityHelper from '../modules/helpers/ActivityHelper';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import * as PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as WorkspaceHelper from '../modules/helpers/WorkspaceHelper';
import * as TeamMemberHelper from '../modules/helpers/TeamMemberHelper';
import * as UserHelper from '../modules/helpers/UserHelper';
import ActivityHydrator from '../modules/helpers/ActivityHydrator';
import ActivityFundingTotals from '../modules/activity/ActivityFundingTotals';
import Notification from '../modules/helpers/NotificationHelper';
import { WORKSPACE_ID, WORKSPACE_LEAD_ID } from '../utils/constants/WorkspaceConstants';
import { resetDesktop } from '../actions/DesktopAction';
import { addMessage } from './NotificationAction';
import { checkIfShouldSyncBeforeLogout } from './LoginAction';
import translate from '../utils/translate';
import * as Utils from '../utils/Utils';
import ActivityStatusValidation from '../modules/activity/ActivityStatusValidation';
import DateUtils from '../utils/DateUtils';
import LoggerManager from '../modules/util/LoggerManager';
import * as ContactAction from './ContactAction';
import * as ResourceAction from './ResourceAction';
import { TEAM_MEMBER_USER_ID } from '../utils/constants/UserConstants';

export const ACTIVITY_LOAD_PENDING = 'ACTIVITY_LOAD_PENDING';
export const ACTIVITY_LOAD_FULFILLED = 'ACTIVITY_LOAD_FULFILLED';
export const ACTIVITY_LOAD_REJECTED = 'ACTIVITY_LOAD_REJECTED';
export const ACTIVITY_SAVE_PENDING = 'ACTIVITY_SAVE_PENDING';
export const ACTIVITY_SAVE_FULFILLED = 'ACTIVITY_SAVE_FULFILLED';
export const ACTIVITY_SAVE_REJECTED = 'ACTIVITY_SAVE_REJECTED';
export const ACTIVITY_UNLOADED = 'ACTIVITY_UNLOADED';
export const ACTIVITY_VALIDATED = 'ACTIVITY_VALIDATED';
export const ACTIVITY_FIELD_VALIDATED = 'ACTIVITY_FIELD_VALIDATED';
export const ACTIVITY_UPDATE_GLOBAL_STATE = 'ACTIVITY_UPDATE_GLOBAL_STATE';
export const ACTIVITY_LOADED_FOR_AF = 'ACTIVITY_LOADED_FOR_AF';
const ACTIVITY_LOAD = 'ACTIVITY_LOAD';
const ACTIVITY_SAVE = 'ACTIVITY_SAVE';

const logger = new LoggerManager('ActivityAction.js');

export function loadActivityForActivityPreview(activityId) {
  const paths = [...FieldPathConstants.ADJUSTMENT_TYPE_PATHS, ActivityConstants.CREATED_BY, ActivityConstants.TEAM,
    ActivityConstants.MODIFIED_BY];
  return (dispatch, ownProps) =>
    dispatch({
      type: ACTIVITY_LOAD,
      payload: _loadActivity({
        activityId,
        wsId: ownProps().workspaceReducer.currentWorkspace.id,
        possibleValuesPaths: paths,
        currentWorkspaceSettings: ownProps().workspaceReducer.currentWorkspaceSettings,
        currencyRatesManager: ownProps().currencyRatesReducer.currencyRatesManager,
        currentLanguage: ownProps().translationReducer.lang,
        wsPrefix: ownProps().workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]
      }).then(data => {
        ContactAction.loadHydratedContactsForActivity(data.activity)(dispatch, ownProps);
        ResourceAction.loadHydratedResourcesForActivity(data.activity)(dispatch, ownProps);
        return data;
      })
    });
}

export function loadActivityForActivityForm(activityId) {
  return (dispatch, ownProps) => {
    dispatch({
      type: ACTIVITY_LOAD,
      payload: _loadActivity({
        activityId,
        wsId: ownProps().workspaceReducer.currentWorkspace.id,
        isAF: true,
        possibleValuesPaths: null,
        currentWorkspaceSettings: ownProps().workspaceReducer.currentWorkspaceSettings,
        currencyRatesManager: ownProps().currencyRatesReducer.currencyRatesManager,
        currentLanguage: ownProps().translationReducer.lang,
        wsPrefix: ownProps().workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]
      }).then(data => {
        dispatch({ type: ACTIVITY_LOADED_FOR_AF });
        ContactAction.loadHydratedContactsForActivity(data.activity)(dispatch, ownProps);
        ResourceAction.loadHydratedResourcesForActivity(data.activity)(dispatch, ownProps);
        return data;
      })
    });
  };
}

export function unloadActivity() {
  return (dispatch, ownProps) => {
    dispatch({
      type: ACTIVITY_UNLOADED
    });
    ContactAction.unloadContacts()(dispatch, ownProps);
    ResourceAction.unloadResources()(dispatch, ownProps);
  };
}

export function reportActivityValidation(validationResult) {
  return (dispatch) =>
    dispatch({
      type: ACTIVITY_VALIDATED,
      payload: validationResult
    });
}

export function reportFieldValidation(fieldPath, validationResult) {
  return (dispatch) =>
    dispatch({
      type: ACTIVITY_FIELD_VALIDATED,
      payload: { fieldPath, validationResult }
    });
}

export function saveActivity(activity) {
  return (dispatch, ownProps) => {
    ResourceAction.tryToAutoAddPendingResourcesToActivity(activity)(dispatch, ownProps);
    dispatch({
      type: ACTIVITY_SAVE,
      payload: _saveActivity(activity, ownProps().userReducer.teamMember,
        ownProps().activityReducer.activityFieldsManager.fieldsDef, dispatch)
        .then((savedActivity) =>
          Promise.all([
            ContactAction.dehydrateAndSaveActivityContacts(savedActivity)(dispatch, ownProps),
            ResourceAction.dehydrateAndSaveActivityResources(activity)(dispatch, ownProps)
          ]).then(() => savedActivity)
        )
    });
  };
}

function _loadActivity({
                         activityId, wsId, possibleValuesPaths, currentWorkspaceSettings, currencyRatesManager,
                         isAF, currentLanguage, wsPrefix
                       }) {
  const pvFilter = possibleValuesPaths ? { id: { $in: possibleValuesPaths } } : {};
  return Promise.all([
    _getActivity(activityId, wsId),
    FieldsHelper.findByWorkspaceMemberIdAndType(wsId, Constants.SYNCUP_TYPE_ACTIVITY_FIELDS),
    PossibleValuesHelper.findAll(pvFilter),
    isAF ? ActivityHelper.findAllNonRejected({ id: { $ne: activityId } },
      Utils.toMap(ActivityConstants.PROJECT_TITLE, 1)) : []
  ])
    .then(([activity, fieldsDef, possibleValuesCollection, otherProjectTitles]) => {
      fieldsDef = fieldsDef[Constants.SYNCUP_TYPE_ACTIVITY_FIELDS];
      const activityFieldsManager = new FieldsManager(fieldsDef, possibleValuesCollection, currentLanguage,
        LoggerManager, wsPrefix);
      const activityFundingTotals = new ActivityFundingTotals(activity, activityFieldsManager,
        currentWorkspaceSettings, currencyRatesManager);
      const activityWsId = activity[ActivityConstants.TEAM] && activity[ActivityConstants.TEAM].id;
      otherProjectTitles = Utils.flattenToListByKey(otherProjectTitles, ActivityConstants.PROJECT_TITLE);
      return WorkspaceHelper.findById(activityWsId)
        .then(activityWorkspace => _getActivityWsManager(activityWorkspace)
          .then(activityWSManager => ({
            activity,
            activityWorkspace,
            activityWSManager,
            activityFieldsManager,
            activityFundingTotals,
            currentWorkspaceSettings,
            currencyRatesManager,
            otherProjectTitles
          })));
    })
    .catch(error => Promise.reject(_toNotification(error)));
}

const _getActivityWsManager = (activityWorkspace) => {
  if (activityWorkspace) {
    return TeamMemberHelper.findByTeamMemberId(activityWorkspace[WORKSPACE_LEAD_ID])
      .then(teamMember => {
        if (teamMember) {
          return UserHelper.findById(teamMember[TEAM_MEMBER_USER_ID]);
        } else {
          return Promise.resolve(null);
        }
      });
  }
  return Promise.resolve(null);
};

const _toNotification = (error) => new Notification(

  { message: error, origin: ErrorConstants.NOTIFICATION_ORIGIN_ACTIVITY });

const _getActivity = (activityId, wsId) => {
  // special case for the new activity
  if (activityId === ValueConstants.NEW_ACTIVITY_ID) {
    return Promise.resolve({});
  }
  return ActivityHelper.findAll({ id: activityId }).then(activity =>
    ActivityHydrator.hydrateActivity({ activity: activity[0], fieldPaths: [], wsId }));
};

function _saveActivity(activity, teamMember, fieldDefs, dispatch) {
  const dehydrator = new ActivityHydrator(fieldDefs);
  return dehydrator.dehydrateActivity(activity).then(dehydratedActivity => {
    const modifiedOn = DateUtils.getTimestampForAPI();
    if (!dehydratedActivity[ActivityConstants.TEAM]) {
      dehydratedActivity[ActivityConstants.TEAM] = teamMember[WORKSPACE_ID];
    }
    if (!dehydratedActivity[ActivityConstants.CREATED_BY]) {
      dehydratedActivity[ActivityConstants.CREATED_BY] = teamMember.id;
    }
    if (!dehydratedActivity[ActivityConstants.CREATED_ON] && !dehydratedActivity[ActivityConstants.CLIENT_CREATED_ON]) {
      dehydratedActivity[ActivityConstants.CLIENT_CREATED_ON] = modifiedOn;
    }
    dehydratedActivity[ActivityConstants.MODIFIED_BY] = teamMember.id;
    dehydratedActivity[ActivityConstants.CLIENT_UPDATED_ON] = modifiedOn;
    delete dehydratedActivity[ActivityConstants.IS_PUSHED];

    return ActivityStatusValidation.statusValidation(dehydratedActivity, teamMember, false).then(() => (
      ActivityHelper.saveOrUpdate(dehydratedActivity, true).then((savedActivity) => {
        dispatch(addMessage(new Notification({
          message: translate('activitySavedMsg'),
          origin: ErrorConstants.NOTIFICATION_ORIGIN_ACTIVITY,
          severity: ErrorConstants.NOTIFICATION_SEVERITY_INFO
        })));
        // TODO this reset is useless if we choose to stay within AF when activity is saved
        dispatch(resetDesktop());
        checkIfShouldSyncBeforeLogout();
        // DO NOT return anything else! It is recorded by the reducer and refreshes AF when you choose to stay in AF
        return savedActivity;
      })
    ));
  }).catch(error => {
    logger.error(error);
    return unableToSave('activitySavedError')(dispatch);
  });
}

export function unableToSave(error) {
  logger.info('unableToSave');
  return dispatch => dispatch(addMessage(new Notification({
    message: error,
    origin: ErrorConstants.NOTIFICATION_ORIGIN_ACTIVITY,
    severity: ErrorConstants.NOTIFICATION_SEVERITY_ERROR
  })));
}

export function updateActivityGlobalState(setting, value) {
  return {
    type: ACTIVITY_UPDATE_GLOBAL_STATE,
    actionData: Utils.toMap(setting, value)
  };
}
