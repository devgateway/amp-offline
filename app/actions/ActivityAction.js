import * as ActivityHelper from '../modules/helpers/ActivityHelper';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import * as PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as WorkspaceHelper from '../modules/helpers/WorkspaceHelper';
import ActivityHydrator from '../modules/helpers/ActivityHydrator';
import ActivityFieldsManager from '../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../modules/activity/ActivityFundingTotals';
import Notification from '../modules/helpers/NotificationHelper';
import {
  CLIENT_CREATED_ON,
  CLIENT_UPDATED_ON,
  CREATED_BY,
  CREATED_ON,
  MODIFIED_BY,
  TEAM
} from '../utils/constants/ActivityConstants';
import { NEW_ACTIVITY_ID } from '../utils/constants/ValueConstants';
import {
  NOTIFICATION_ORIGIN_ACTIVITY,
  NOTIFICATION_SEVERITY_INFO
} from '../utils/constants/ErrorConstants';
import { ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH } from '../utils/constants/FieldPathConstants';
import { resetDesktop } from '../actions/DesktopAction';
import { addMessage } from './NotificationAction';
import translate from '../utils/translate';

export const ACTIVITY_LOAD_PENDING = 'ACTIVITY_LOAD_PENDING';
export const ACTIVITY_LOAD_FULFILLED = 'ACTIVITY_LOAD_FULFILLED';
export const ACTIVITY_LOAD_REJECTED = 'ACTIVITY_LOAD_REJECTED';
export const ACTIVITY_SAVE_PENDING = 'ACTIVITY_SAVE_PENDING';
export const ACTIVITY_SAVE_FULFILLED = 'ACTIVITY_SAVE_FULFILLED';
export const ACTIVITY_SAVE_REJECTED = 'ACTIVITY_SAVE_REJECTED';
export const ACTIVITY_UNLOADED = 'ACTIVITY_UNLOADED';
export const ACTIVITY_VALIDATED = 'ACTIVITY_VALIDATED';
export const ACTIVITY_FIELD_VALIDATED = 'ACTIVITY_FIELD_VALIDATED';
const ACTIVITY_LOAD = 'ACTIVITY_LOAD';
const ACTIVITY_SAVE = 'ACTIVITY_SAVE';

export function loadActivityForActivityPreview(activityId) {
  const paths = [ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH, CREATED_BY, TEAM, MODIFIED_BY];
  return (dispatch, ownProps) =>
    dispatch({
      type: ACTIVITY_LOAD,
      payload: _loadActivity(activityId, ownProps().userReducer.teamMember.id, paths,
        ownProps().workspaceReducer.currentWorkspaceSettings, ownProps().currencyRatesReducer.currencyRatesManager)
    });
}

export function loadActivityForActivityForm(activityId) {
  return (dispatch, ownProps) =>
    dispatch({
      type: ACTIVITY_LOAD,
      payload: _loadActivity(activityId, ownProps().userReducer.teamMember.id)
    });
}

export function unloadActivity() {
  return (dispatch) =>
    dispatch({
      type: ACTIVITY_UNLOADED
    });
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
    dispatch({
      type: ACTIVITY_SAVE,
      payload: _saveActivity(activity, ownProps().userReducer.teamMember,
        ownProps().activityReducer.activityFieldsManager.fieldsDef, dispatch)
    });
  };
}

function _loadActivity(activityId, teamMemberId, possibleValuesPaths, currentWorkspaceSettings, currencyRatesManager) {
  return new Promise((resolve, reject) => {
    const pvFilter = possibleValuesPaths ? { id: { $in: possibleValuesPaths } } : {};
    return Promise.all([
      _getActivity(activityId),
      FieldsHelper.findByWorkspaceMemberId(teamMemberId),
      PossibleValuesHelper.findAll(pvFilter)
    ])
      .then(([activity, fieldsDef, possibleValuesCollection]) => {
        fieldsDef = fieldsDef.fields;
        const activityFieldsManager = new ActivityFieldsManager(fieldsDef, possibleValuesCollection);
        const activityFundingTotals = new ActivityFundingTotals(activity, activityFieldsManager,
          currentWorkspaceSettings, currencyRatesManager);
        const activityWsId = activity[TEAM] && activity[TEAM].id;
        return WorkspaceHelper.findById(activityWsId).then(activityWorkspace =>
          resolve({
            activity,
            activityWorkspace,
            activityFieldsManager,
            activityFundingTotals,
            currentWorkspaceSettings,
            currencyRatesManager
          })
        ).catch(error => reject(_toNotification(error)));
      }).catch(error => reject(_toNotification(error)));
  });
}

const _toNotification = (error) => new Notification({ message: error, origin: NOTIFICATION_ORIGIN_ACTIVITY });

const _getActivity = (activityId) => {
  // special case for the new activity
  if (activityId === NEW_ACTIVITY_ID) {
    return Promise.resolve({});
  }
  return ActivityHelper.findNonRejectedById(activityId).then(activity =>
    ActivityHydrator.hydrateActivity({ activity }));
};

function _saveActivity(activity, teamMember, fieldDefs, dispatch) {
  const dehydrator = new ActivityHydrator(fieldDefs);
  return dehydrator.dehydrateActivity(activity).then(dehydratedActivity => {
    const modifiedOn = (new Date()).toISOString();
    if (!dehydratedActivity[TEAM]) {
      dehydratedActivity[TEAM] = teamMember['workspace-id'];
    }
    if (!dehydratedActivity[CREATED_BY]) {
      dehydratedActivity[CREATED_BY] = teamMember.id;
    }
    if (!dehydratedActivity[CREATED_ON] && !dehydratedActivity[CLIENT_CREATED_ON]) {
      dehydratedActivity[CLIENT_CREATED_ON] = modifiedOn;
    }
    dehydratedActivity[MODIFIED_BY] = teamMember.id;
    dehydratedActivity[CLIENT_UPDATED_ON] = modifiedOn;
    return ActivityHelper.saveOrUpdate(dehydratedActivity).then((savedActivity) => {
      dispatch(addMessage(new Notification({
        message: translate('activitySavedMsg'),
        origin: NOTIFICATION_ORIGIN_ACTIVITY,
        severity: NOTIFICATION_SEVERITY_INFO
      })));
      // TODO this reset is useless if we choose to stay within AF when activity is saved
      dispatch(resetDesktop());
      // DO NOT return anything else! It is recorded by the reducer and refreshes AF when you choose to stay in AF
      return savedActivity;
    });
  });
}
