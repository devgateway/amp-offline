import * as ActivityHelper from '../modules/helpers/ActivityHelper';
import * as FieldsHelper from '../modules/helpers/FieldsHelper';
import * as PossibleValuesHelper from '../modules/helpers/PossibleValuesHelper';
// import ActivityHydrator from '../modules/helpers/ActivityHydrator';
import ActivityFieldsManager from '../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../modules/activity/ActivityFundingTotals';

export const ACTIVITY_LOAD_PENDING = 'ACTIVITY_LOAD_PENDING';
export const ACTIVITY_LOAD_FULFILLED = 'ACTIVITY_LOAD_FULFILLED';
export const ACTIVITY_LOAD_ERROR = 'ACTIVITY_LOAD_ERROR';

export function loadActivityForActivityPreview(activityId) {
  const paths = ['funding~funding_details~transaction_type', 'funding~funding_details~adjustment_type'];
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
      _getActivity(activityId),
      FieldsHelper.findByWorkspaceMemberId(teamMemberId),
      PossibleValuesHelper.findAll(pvFilter)
    ])
      .then(([activity, fieldDefs, possibleOptionsCollection]) => {
        const activityFieldsManager = new ActivityFieldsManager(fieldDefs.fields, possibleOptionsCollection);
        const activityFundingTotals = new ActivityFundingTotals(activity, activityFieldsManager);
        return resolve({
          type: ACTIVITY_LOAD_FULFILLED,
          actionData: { activity, activityFieldsManager, activityFundingTotals }
        });
      })
      .catch(reject);
  });
}

const _getError = (error) => ({
  type: ACTIVITY_LOAD_ERROR,
  actionData: { errorMessage: error }
});

const _getActivity = (activityId) =>
  new Promise((resolve, reject) =>
    ActivityHelper.findNonRejectedById(activityId)
      .then(activity => {
        /* TODO update to this
         ActivityHydrator.hydrateActivity(activity).then(...
         */
        console.log(activity.id);
        return resolve(activity);
      }
    ).catch(reject));
