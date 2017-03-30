import * as ActivityHelper from '../modules/helpers/ActivityHelper';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import * as PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
import * as WorkspaceHelper from '../modules/helpers/WorkspaceHelper';
import ActivityHydrator from '../modules/helpers/ActivityHydrator';
import ActivityFieldsManager from '../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../modules/activity/ActivityFundingTotals';
import Notification from '../modules/helpers/NotificationHelper';
import { TEAM } from '../utils/constants/ActivityConstants';
import { NOTIFICATION_ORIGIN_ACTIVITY } from '../utils/constants/ErrorConstants';
import { ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH } from '../utils/constants/FieldPathConstants';

export const ACTIVITY_LOAD_PENDING = 'ACTIVITY_LOAD_PENDING';
export const ACTIVITY_LOAD_FULFILLED = 'ACTIVITY_LOAD_FULFILLED';
export const ACTIVITY_LOAD_ERROR = 'ACTIVITY_LOAD_ERROR';

export function loadActivityForActivityPreview(activityId) {
  const paths = [ADJUSTMENT_TYPE_PATH, TRANSACTION_TYPE_PATH];
  return (dispatch, ownProps) => {
    dispatch({ type: ACTIVITY_LOAD_PENDING });
    return _loadActivity(activityId, _getTeamMemberId(ownProps().user), paths)
      .then(action => dispatch(action))
      .catch(error => dispatch(_getError(error)));
  };
}

export function loadActivityForActivityForm(activityId) {
  // TODO deep clone
  return (dispatch, ownProps) => {
    dispatch({ type: ACTIVITY_LOAD_PENDING });
    return _loadActivity(activityId, ownProps().user.teamMember.id)
      .then(action => dispatch(action))
      .catch(error => dispatch(_getError(error)));
  };
}

function _getTeamMemberId(/* user */) {
  // TODO use from context once it is set there
  // return user.teamMember.id;
  return 785;
}

function _loadActivity(activityId, teamMemberId, possibleValuesPaths) {
  return new Promise((resolve, reject) => {
    const pvFilter = possibleValuesPaths ? { id: { $in: possibleValuesPaths } } : {};
    return Promise.all([
      _getActivity(activityId, teamMemberId),
      FieldsHelper.findByWorkspaceMemberId(teamMemberId),
      PossibleValuesHelper.findAll(pvFilter)
    ])
      .then(([activity, fieldDefs, possibleOptionsCollection]) => {
        const activityFieldsManager = new ActivityFieldsManager(fieldDefs.fields, possibleOptionsCollection);
        const activityFundingTotals = new ActivityFundingTotals(activity, activityFieldsManager);
        return WorkspaceHelper.findById(activity[TEAM]).then(activityWorkspace =>
          resolve({
            type: ACTIVITY_LOAD_FULFILLED,
            actionData: { activity, activityWorkspace, activityFieldsManager, activityFundingTotals }
          })
        ).catch(reject);
      }).catch(error => reject(new Notification({ message: error, origin: NOTIFICATION_ORIGIN_ACTIVITY })));
  });
}

const _getError = (error) => ({
  type: ACTIVITY_LOAD_ERROR,
  actionData: { errorMessage: error }
});

// TODO remove teamMemberId once it is set under user during workspace selection
const _getActivity = (activityId, teamMemberId) =>
  ActivityHelper.findNonRejectedById(activityId).then(activity =>
    ActivityHydrator.hydrateActivity({ activity, teamMember: { id: teamMemberId } }));
