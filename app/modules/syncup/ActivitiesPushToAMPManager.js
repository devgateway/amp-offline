import * as UserHelper from '../helpers/UserHelper';
import * as TeamMemberHelper from '../helpers/TeamMemberHelper';
import * as ActivityHelper from '../helpers/ActivityHelper';
import store from '../../index';
import Notification from '../helpers/NotificationHelper';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import translate from '../../utils/translate';
import { NOTIFICATION_ORIGIN_API_SYNCUP } from '../../utils/constants/ErrorConstants';
import { ACTIVITY_IMPORT_URL } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';

/* eslint-disable class-methods-use-this */
/**
 * Activities push to AMP Manager
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPushToAMPManager {
  constructor() {
    this._cancel = false;
  }

  /**
   * Interrupt activities sync up gracefully
   * @param cancel
   */
  set cancel(cancel) {
    /*
    TODO cancel handling is planned for later AMPOFFLINE-208
    This 'cancel' flag may not be used or if used, then it will have to be checked between smallest steps.
     */
    this._cancel = cancel;
  }
  /**
   * Pushes activities to AMP
   * @param saved the activities saved as new or update on AMP
   * @param removed deleted activities on AMP
   * @return {Promise}
   */
  pushActivitiesToAMP(saved, removed) {
    console.log('syncUpActivities');
    return new Promise((resolve, reject) => {
      // check current user can continue to sync; it shouldn't reach this point (user must be automatically logged out)
      if (store.getState().user.userData.ampOfflinePassword) {
        return this._rejectActivitiesClientSide(saved, removed)
          .then(() => {
            const steps = [
              this._getValidUsers, this._getWSMembers, this._getActivitiesToPush, this._pushActivities.bind(this)];
            return this._pushSteps(steps);
          }).then(resolve).catch(reject);
      }
      const errorMsgTrn = translate('SyncupDeniedMustRelogin');
      reject(new Notification({ message: errorMsgTrn, origin: NOTIFICATION_ORIGIN_API_SYNCUP }));
    });
  }

  /**
   * Rejects activities on the client side using activities diff
   * @param saved the activities saved as new or update on AMP
   * @param removed deleted activities on AMP
   * @return {Promise.<Array>}
   * @private
   */
  /* eslint-disable no-unused-vars */
  _rejectActivitiesClientSide(saved, removed) {
    /* eslint-enable no-unused-vars */
    /*
     TODO client side reject of some activities (iteration 2+):
     1) no longer rights to edit
     2) activities with new changes on AMP (but not those that came from this client)
     */
    return Promise.resolve([]);
  }

  _pushSteps(steps) {
    console.log('_pushSteps');
    return steps.reduce((currentPromise, promiseFactory) => currentPromise.then(promiseFactory), Promise.resolve());
  }

  /**
   * Find workspace members for users that still have right to use AMP Offline
   * @private
   * @return {Promise}
   */
  _getValidUsers() {
    console.log('_getValidUsers');
    const filter = { $and: [{ 'is-banned': { $ne: true } }, { 'is-active': { $ne: true } }] };
    const projections = { id: 1 };
    return UserHelper.findAllUsersByExample(filter, projections);
  }

  _getWSMembers(users) {
    const wsMembersFilter = { 'user-id': { $in: Utils.flattenToListByKey(users, 'id') } };
    return TeamMemberHelper.findAll(wsMembersFilter);
  }

  /**
   * Get all activities modified by the specified workspace members only and filter out rejected activities
   * @param workspaceMembers
   * @private
   * @returns {Promise}
   */
  _getActivitiesToPush(workspaceMembers) {
    console.log('_getActivitiesToPush');
    const wsMembersIds = Utils.flattenToListByKey(workspaceMembers, 'id');
    const modifiedBySpecificWSMembers = Utils.toMap(AC.MODIFIED_BY, { $in: wsMembersIds });
    return ActivityHelper.findAllNonRejectedModifiedOnClient(modifiedBySpecificWSMembers);
  }

  /**
   * Pushes activities to AMP and provides the activities that where rejected
   * @param activities
   * @private
   * @return {Promise}
   */
  _pushActivities(activities) {
    console.log('_pushActivities');
    // executing push one by one for now and sequentially to avoid AMP / client overload
    return new Promise((resolve, reject) => {
      if (!activities) {
        return Promise.resolve();
      }
      return activities.reduce((currentPromise, nextActivity) =>
        currentPromise.then(() => {
          if (this._cancel === true) {
            return resolve();
          }
          // uninterruptible call
          return this._pushActivity(nextActivity);
        }), Promise.resolve()).then(resolve).catch(reject);
    });
  }

  _pushActivity(activity) {
    console.log('_pushActivity');
    // TODO remove once invalid fields are ignored by AMP
    /* eslint-disable no-param-reassign */
    activity = Object.assign({}, activity);
    delete activity[AC.CLIENT_CHANGE_ID];
    /* eslint-enable no-param-reassign */
    return new Promise((resolve) =>
      /*
       shouldRetry: true may be problematic if the request was received but timed out
       => we need a reasonable timeout for now to minimize such risk
       Final solution will be handled with 'client-change-id' - proposed for iteration 2
       */
      ConnectionHelper.doPost(
        { url: ACTIVITY_IMPORT_URL, body: activity, shouldRetry: false, extraUrlParam: activity[AC.INTERNAL_ID] })
        .then((pushResult) => this._processPushResult({ activity, pushResult })).then(resolve)
        .catch((error) => this._processPushResult({ activity, error }).then(resolve))
    );
  }

  /**
   * Process activity push result - an uninterruptable method
   * @param activity
   * @param pushResult
   * @param error
   * @private
   */
  _processPushResult({ activity, pushResult, error }) {
    console.log('_processPushResult');
    // save the rejection immediately to allow a quicker syncup cancellation
    const errorData = error || (pushResult ? pushResult.error : undefined);
    if (errorData) {
      // TODO the unsynced activity should be remembered and resynced on next attempt AMPOFFLINE-256
      return new Promise((resolve, reject) => ActivityHelper.removeNonRejectedById(activity.id)
        .then(() => this._getRejectedId(activity))
        .then(rejectedId => this._saveRejectedActivity(activity, rejectedId, errorData))
        .then(resolve)
        .catch(reject));
    }
    return Promise.resolve();
  }

  _getRejectedId(activity) {
    console.log('_getRejectedId');
    // check if it was already rejected before and increment the maximum rejectedId
    const ampId = activity[AC.AMP_ID];
    const projectTile = activity[AC.PROJECT_TITLE];
    let filter = null;
    // first by ampId, if the activity is also available on AMP server
    if (ampId) {
      filter = Utils.toMap(AC.AMP_ID, ampId);
    } else if (projectTile) {
      // or try to match by the same project title for same named activities not yet available on AMP server
      // TODO adjust for multilingual - iteration 2+
      filter = Utils.toMap(AC.PROJECT_TITLE, projectTile);
    }
    if (filter !== null) {
      const projections = Utils.toMap(AC.REJECTED_ID, 1);
      /* Assuming for simplicity for now we'll use the max found rejectedId and increment it.
       Once we add the option to delete rejected activities from storage, some rejectedIds will be reused.
       If it will be needed, we can always increment, that will require tracking rejected # per activity
       */
      return new Promise((resolve, reject) => ActivityHelper.findAllRejected(filter, projections).then(
        prevRejections => {
          const maxRejectedId = prevRejections.reduce((curr, next) => Math.max(curr, next[AC.REJECTED_ID]), 0);
          return maxRejectedId + 1;
        }).then(resolve).catch(reject));
    }
    return Promise.resolve(1);
  }

  _saveRejectedActivity(activity, rejectedId, error) {
    console.log('_saveRejectActivity');
    const rejectedActivity = activity;
    rejectedActivity[AC.REJECTED_ID] = rejectedId;
    rejectedActivity[AC.PROJECT_TITLE] = `${activity[AC.PROJECT_TITLE]}_${translate('Rejected')}${rejectedId}`;
    rejectedActivity.error = error;
    return ActivityHelper.saveOrUpdate(rejectedActivity);
  }
}
