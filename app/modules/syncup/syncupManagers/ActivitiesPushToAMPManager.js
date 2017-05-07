import * as UserHelper from '../../helpers/UserHelper';
import * as TeamMemberHelper from '../../helpers/TeamMemberHelper';
import * as ActivityHelper from '../../helpers/ActivityHelper';
import store from '../../../index';
import Notification from '../../helpers/NotificationHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import * as Utils from '../../../utils/Utils';
import translate from '../../../utils/translate';
import { NOTIFICATION_ORIGIN_API_SYNCUP } from '../../../utils/constants/ErrorConstants';
import { ACTIVITY_IMPORT_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import SyncUpManagerInterface from './SyncUpManagerInterface';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */
/**
 * Activities push to AMP Manager
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPushToAMPManager extends SyncUpManagerInterface {
  constructor() {
    super();
    LoggerManager.log('ActivitiesPushToAMPManager');
    this._cancel = false;
  }

  /**
   * Interrupt activities sync up gracefully
   */
  cancel() {
    /*
     TODO cancel handling is planned for later AMPOFFLINE-208
     This 'cancel' flag may not be used or if used, then it will have to be checked between smallest steps.
     */
    this._cancel = true;
  }

  /**
   * Pushes activities to AMP
   * @param diff the activities difference from AMP, with saved and removed activities (if any)
   * @return {Promise}
   */
  doSyncUp(diff) {
    this.diff = [];
    this.pushed = new Set();
    return this._pushActivitiesToAMP(diff);
  }

  getDiffLeftover() {
    this.diff = this.diff.filter(id => !this.pushed.has(id));
    return this.diff;
  }

  _pushActivitiesToAMP(diff) {
    LoggerManager.log('_pushActivitiesToAMP');
    return new Promise((resolve, reject) => {
      // check current user can continue to sync; it shouldn't reach this point (user must be automatically logged out)
      if (store.getState().user.userData.ampOfflinePassword) {
        return this._rejectActivitiesClientSide(diff)
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
   * @param diff the activities difference with saved and removed activities (if any)
   * @return {Promise.<Array>}
   * @private
   */
  /* eslint-disable no-unused-vars */
  _rejectActivitiesClientSide(diff) {
    /* eslint-enable no-unused-vars */
    /*
     TODO client side reject of some activities (iteration 2+):
     1) no longer rights to edit
     2) activities with new changes on AMP (but not those that came from this client)
     */
    return Promise.resolve([]);
  }

  _pushSteps(steps) {
    LoggerManager.log('_pushSteps');
    return steps.reduce((currentPromise, promiseFactory) => currentPromise.then(promiseFactory), Promise.resolve());
  }

  /**
   * Find workspace members for users that still have right to use AMP Offline
   * @private
   * @return {Promise}
   */
  _getValidUsers() {
    LoggerManager.log('_getValidUsers');
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
    LoggerManager.log('_getActivitiesToPush');
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
    LoggerManager.log('_pushActivities');
    this.diff = activities.map(activity => activity.id);
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
    LoggerManager.log('_pushActivity');
    // TODO remove once invalid fields are ignored by AMP
    activity = Object.assign({}, activity);
    delete activity[AC.CLIENT_CHANGE_ID];
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
    LoggerManager.log('_processPushResult');
    // save the rejection immediately to allow a quicker syncup cancellation
    const errorData = error || (pushResult ? pushResult.error : undefined);
    if (errorData) {
      return new Promise((resolve, reject) => this._getRejectedId(activity)
        .then(rejectedId => this._saveRejectedActivity(activity, rejectedId, errorData))
        .then(resolve)
        .catch(reject));
    } else {
      this.pushed.add(activity.id);
    }
    return Promise.resolve();
  }

  _getRejectedId(activity) {
    LoggerManager.log('_getRejectedId');
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
    LoggerManager.log('_saveRejectActivity');
    const rejectedActivity = activity;
    rejectedActivity[AC.REJECTED_ID] = rejectedId;
    rejectedActivity[AC.PROJECT_TITLE] = `${activity[AC.PROJECT_TITLE]}_${translate('Rejected')}${rejectedId}`;
    rejectedActivity.error = error;
    return ActivityHelper.saveOrUpdate(rejectedActivity);
  }
}

