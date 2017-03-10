import * as UserHelper from '../helpers/UserHelper';
import * as TeamMemberHelper from '../helpers/TeamMemberHelper';
import * as ActivityHelper from '../helpers/ActivityHelper';
import Notification from '../helpers/NotificationHelper';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import translate from '../../utils/translate';
import { NOTIFICATION_ORIGIN_API_SYNCUP } from '../../utils/constants/ErrorConstants';
import { ACTIVITY_IMPORT_URL, ACTIVITY_EXPORT_URL } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';

/**
 * Activities SyncUp processor
 * @author Nadejda Mandrescu
 */
export default class SyncUpActivities {
  constructor() {
    this._cancel = false;
  }

  /**
   * Interrupts
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
   * Imports activities to AMP
   * @param activitiesDiff the activities difference from the general syncup EP
   * @return {Promise}
   */
  importActivitiesToAMP(activitiesDiff) {
    console.log('syncUpActivities');
    return (dispatch, ownProps) => new Promise((resolve, reject) => {
      // check current user can continue to sync; it shouldn't reach this point (user must be automatically logged out)
      if (ownProps.user.userData.plainPassword) {
        return this._rejectActivitiesClientSide(activitiesDiff).then(this._import).then(resolve).catch(reject);
      }
      const errorMsgTrn = translate('SyncupDeniedMustRelogin');
      reject(new Notification({ message: errorMsgTrn, origin: NOTIFICATION_ORIGIN_API_SYNCUP }));
    });
  }

  /* eslint-disable no-unused-vars */
  static _rejectActivitiesClientSide(activitiesDiff) {
    /* eslint-enable no-unused-vars */
    /*
     TODO client side reject of some activities (iteration 2+):
     1) no longer rights to edit
     2) activities with new changes on AMP (but not those that came from this client)
     */
    return Promise.resolve([]);
  }

  _import() {
    console.log('_import');
    return this._validWorkspaceMembers()
      .then(this._getActivitiesToImport)
      .then(this._importActivities);
  }

  /**
   * Find workspace members for users that still have right to use AMP Offline
   * @private
   * @return {Promise}
   */
  _validWorkspaceMembers() {
    console.log('_validWorkspaceMembers');
    const filter = { $and: [{ 'is-banned': { $ne: true } }, { 'is-active': { $ne: true } }] };
    const projections = { id: 1 };
    return UserHelper.findAllUsersByExample(filter, projections).then(this._getWSMembers);
  }

  static _getWSMembers(users) {
    const wsMembersFilter = { 'user-id': { $in: Utils.flattenToListByKey(users, 'id') } };
    return TeamMemberHelper.findAll(wsMembersFilter);
  }

  /**
   * Get all activities modified by the specified workspace members only and filter out rejected activities
   * @param workspaceMembers
   * @private
   * @returns {Promise}
   */
  static _getActivitiesToImport(workspaceMembers) {
    console.log('_getActivitiesToImport');
    const wsMembersIds = Utils.flattenToListByKey(workspaceMembers, 'id');
    const modifiedBySpecificWSMembers = Utils.toMap(AC.MODIFIED_BY, { $in: wsMembersIds });
    return ActivityHelper.findAllNonRejected(modifiedBySpecificWSMembers);
  }

  /**
   * Imports activities to AMP and provides the activities that where rejected
   * @param activities
   * @private
   * @return {Promise}
   */
  _importActivities(activities) {
    console.log('_importActivities');
    // executing import one by one for now and sequentially to avoid AMP overload
    return new Promise((resolve, reject) => {
      activities.reduce((currentPromise, nextActivity) =>
        currentPromise.then(() => {
          if (this._cancel === true) {
            return resolve();
          }
          // uninterruptible call
          return this._importActivity(nextActivity);
        }), Promise.resolve()).then(resolve).catch(reject);
    });
  }

  _importActivity(activity) {
    console.log('_importActivity');
    return new Promise((resolve, reject) =>
    /*
    shouldRetry: true may be problematic if the request was received but timed out
    => we need a reasonable timeout for now to minimize such risk, while if anything didn't sync
    Final solution will be handled with 'client-change-id' - proposed for iteration 2
     */
    // TODO: add timeout handling, to continue the process, to not halt entire list import
      ConnectionHelper.doPost(
        { url: ACTIVITY_IMPORT_URL, body: activity, shouldRetry: false, extraUrlParam: activity[AC.INTERNAL_ID] })
        .then((result) => this._processImportResult(activity, result)).then(resolve).catch(reject)
    );
  }

  /**
   * Process activity import result - an uninterruptable method
   * @param activity
   * @param importResult
   * @private
   */
  _processImportResult(activity, importResult) {
    console.log('_processImportResult');
    // save the rejection immediately to allow a quicker syncup cancellation
    if (importResult.error) {
      return this._getRejectedId(activity).then(rejectedId =>
        this._saveRejectedActivity(activity, rejectedId, importResult.error));
    }
    return Promise.resolve();
  }

  static _getRejectedId(activity) {
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
      return ActivityHelper.findAllRejected(filter, projections).then(prevRejections => {
        const maxRejectedId = prevRejections.reduce((curr, next) => Math.max(curr, next[AC.REJECTED_ID]), 0);
        return maxRejectedId + 1;
      });
    }
    return Promise.resolve(1);
  }

  static _saveRejectedActivity(activity, rejectedId, error) {
    console.log('_saveRejectActivity');
    const rejectedActivity = activity;
    rejectedActivity[AC.REJECTED_ID] = rejectedId;
    rejectedActivity[AC.PROJECT_TITLE] = `${activity[AC.PROJECT_TITLE]}_${translate('Rejected')}${rejectedId}`;
    rejectedActivity.error = error;
    return ActivityHelper.saveOrUpdate(rejectedActivity);
  }

  /**
   * Exports activities from AMP by adding/updating them to the client DB
   * @param activitiesDiff the activities difference from the general syncup EP
   * activitiesDiff : {
   *    "saved" : [ampId1, ...],
   *    "removed" : [ampId2, ...]
   * }
   * @return {Promise}
   */
  exportActivitiesFromAMP(activitiesDiff) {
    console.log('exportActivitiesFromAMP');
    return Promise.all([this._removeActivities(activitiesDiff.removed),
      this._getLatestActivities(activitiesDiff.saved)]);
  }

  static _removeActivities(ampIds) {
    const ampIdsFilter = Utils.toMap(AC.AMP_ID, { $in: ampIds });
    // remove both rejected and non rejected if the activity is removed
    return ActivityHelper.removeAll(ampIdsFilter);
  }

  _getLatestActivities(ampIds) {
    return new Promise((resolve, reject) =>
    ampIds.reduce((currentPromise, nextAmpId) => currentPromise.then(
      () => {
        if (this._cancel) {
          return resolve();
        }
        return this._exportActivity(nextAmpId);
      }), Promise.resolve()).then(resolve).catch(reject));
  }

  _exportActivity(ampId) {
    // TODO content translations (iteration 2)
    return ConnectionHelper.doGet({ url: ACTIVITY_EXPORT_URL, extraUrlParam: ampId })
      .then(this._processActivityExport, this._onExportError);
  }

  static _onExportError(error) {
    console.error(error);
    // TODO any special handling
    // normally shouldn't happen
  }

  static _processActivityExport(activity) {
    return ActivityHelper.removeNonRejectedByAmpId(activity[AC.AMP_ID])
      .then(() => ActivityHelper.saveOrUpdate(activity));
  }
}

