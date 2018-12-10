import * as UserHelper from '../../helpers/UserHelper';
import * as TeamMemberHelper from '../../helpers/TeamMemberHelper';
import * as ActivityHelper from '../../helpers/ActivityHelper';
import store from '../../../index';
import Notification from '../../helpers/NotificationHelper';
import * as AC from '../../../utils/constants/ActivityConstants';
import * as CC from '../../../utils/constants/ContactConstants';
import * as RC from '../../../utils/constants/ResourceConstants';
import { SYNCUP_DETAILS_SYNCED, SYNCUP_DETAILS_UNSYNCED, SYNCUP_TYPE_ACTIVITIES_PUSH } from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import translate from '../../../utils/translate';
import { ACTIVITY_IMPORT_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import SyncUpManagerInterface from './SyncUpManagerInterface';
import Logger from '../../util/LoggerManager';
import ContactHelper from '../../helpers/ContactHelper';
import { getActivityContactIds } from '../../../actions/ContactAction';
import { getActivityResourceUuids } from '../../../actions/ResourceAction';
import ResourceHelper from '../../helpers/ResourceHelper';
import * as EC from '../../../utils/constants/ErrorConstants';

const logger = new Logger('Activity push to AMP manager');

/* eslint-disable class-methods-use-this */
/**
 * Activities push to AMP Manager
 * @author Nadejda Mandrescu
 */
export default class ActivitiesPushToAMPManager extends SyncUpManagerInterface {
  constructor() {
    super(SYNCUP_TYPE_ACTIVITIES_PUSH);
    logger.log('ActivitiesPushToAMPManager');
    this._cancel = false;
    this.diff = [];
    this._processed = new Set();
  }

  /**
   * Detects activities that should be pushed to AMP
   * @return {Promise.<activity>}
   */
  static getActivitiesToPush() {
    return ActivitiesPushToAMPManager._getValidUsers()
      .then(ActivitiesPushToAMPManager._getWSMembers)
      .then(ActivitiesPushToAMPManager._getActivitiesToPush);
  }

  /**
   * Find workspace members for users that still have right to use AMP Offline
   * @private
   * @return {Promise}
   */
  static _getValidUsers() {
    logger.log('_getValidUsers');
    const filter = { 'is-banned': { $ne: true } };
    const projections = { id: 1 };
    return UserHelper.findAllClientRegisteredUsersByExample(filter, projections);
  }

  static _getWSMembers(users) {
    const wsMembersFilter = {
      'user-id': { $in: Utils.flattenToListByKey(users, 'id') },
      ...TeamMemberHelper.getExcludeDeletedTeamMembersFilter()
    };
    return TeamMemberHelper.findAll(wsMembersFilter);
  }

  /**
   * Get all activities modified by the specified workspace members only and filter out rejected activities
   * @param workspaceMembers
   * @private
   * @returns {Promise}
   */
  static _getActivitiesToPush(workspaceMembers) {
    logger.log('_getActivitiesToPush');
    const wsMembersIds = Utils.flattenToListByKey(workspaceMembers, 'id');
    const modifiedBySpecificWSMembers = Utils.toMap(AC.MODIFIED_BY, { $in: wsMembersIds });
    // search where IS_PUSHED is set to see why
    const notStalePush = Utils.toMap(AC.IS_PUSHED, { $ne: true });
    const filter = { $and: [modifiedBySpecificWSMembers, notStalePush] };
    return ActivityHelper.findAllNonRejectedModifiedOnClient(filter);
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
    this._details[SYNCUP_DETAILS_SYNCED] = [];
    this._details[SYNCUP_DETAILS_UNSYNCED] = [];
    return this._pushActivitiesToAMP(diff);
  }

  getDiffLeftover() {
    // this leftover won't be used next time, but we calculate it to flag a partial push
    this.diff = this.diff.filter(id => !this._processed.has(id));
    return this.diff;
  }

  _pushActivitiesToAMP(diff) {
    logger.log('_pushActivitiesToAMP');
    // check current user can continue to sync; it shouldn't reach this point (user must be automatically logged out)
    if (store.getState().userReducer.userData.ampOfflinePassword) {
      return this._rejectActivitiesClientSide(diff)
        .then(() => ActivitiesPushToAMPManager.getActivitiesToPush().then(this._pushActivities.bind(this)))
        .then(() => {
          this.done = true;
          return this.done;
        });
    }
    return Promise.reject(new Notification({
      message: 'SyncupDeniedMustRelogin',
      origin: EC.NOTIFICATION_ORIGIN_API_SYNCUP
    }));
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

  /**
   * Pushes activities to AMP and provides the activities that where rejected
   * @param activities
   * @private
   * @return {Promise}
   */
  _pushActivities(activities) {
    logger.log('_pushActivities');
    this.diff = activities.map(activity => activity.id);
    // executing push one by one for now and sequentially to avoid AMP / client overload
    if (!activities) {
      return Promise.resolve();
    }
    return activities.reduce((currentPromise, nextActivity) =>
      currentPromise.then(() => {
        if (this._cancel === true) {
          return Promise.resolve();
        }
        // uninterruptible call
        return this._pushOrRejectActivityClientSide(nextActivity);
      }), Promise.resolve());
  }

  _pushOrRejectActivityClientSide(activity) {
    logger.log('_pushOrRejectActivityClientSide');
    return Promise.all([this._getUnsyncedContacts(activity), this._getUnsyncedResources(activity)])
      .then(([unsyncedContacts, unsyncedResources]) => {
        const errors = [];
        if (unsyncedContacts.length) {
          const cNames = unsyncedContacts.map(c => `"${c[CC.NAME] || ''} ${c[CC.LAST_NAME] || ''}"`).join(', ');
          const replacePairs = [['%contacts%', cNames]];
          errors.push(new Notification({ message: 'rejectActivityWhenContactUnsynced2', replacePairs }));
        }
        if (unsyncedResources.length) {
          const rNames = unsyncedResources.map(r => `"${r[RC.WEB_LINK] || r[RC.FILE_NAME]}"`).join(', ');
          const replacePairs = [['%resources%', rNames]];
          errors.push(new Notification({ message: 'rejectActivityWhenResourceUnsynced2', replacePairs }));
        }
        if (errors.length) {
          return Promise.reject(errors);
        }
        return this._pushActivity(activity);
      }).catch(error => this._processPushResult({ activity, error }));
  }

  _pushActivity(activity) {
    logger.log('_pushActivity');
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

  _getUnsyncedContacts(activity) {
    const contactIds = getActivityContactIds(activity);
    return ContactHelper.findContactsByIds(contactIds)
      .then(contacts => contacts.filter(c => ContactHelper.isModifiedOnClient(c)));
  }

  _getUnsyncedResources(activity) {
    const resourceUuids = getActivityResourceUuids(activity);
    return ResourceHelper.findAllResourcesModifiedOnClientByUuids(resourceUuids);
  }

  /**
   * Process activity push result - an uninterruptable method
   * @param activity
   * @param pushResult
   * @param error
   * @private
   */
  _processPushResult({ activity, pushResult, error }) {
    logger.log('_processPushResult');
    // If we got an EP result, no matter if the import was rejected, then the push was successful.
    // The user may either use a newer activity or fix some validation issues.
    // We also don't need to remember it as a leftover, since we  have to recalculate activities to push each time.
    const isConnectivityError = error instanceof Notification && error.errorCode === EC.ERROR_CODE_NO_CONNECTIVITY;
    if (pushResult || !isConnectivityError) {
      this._processed.add(activity.id);
    }
    // save the rejection immediately to allow a quicker syncup cancellation
    const errorData = error || (pushResult && pushResult.error) || undefined;
    this._updateDetails({ activity, pushResult, errorData });
    if (errorData) {
      return this._getRejectedId(activity)
        .then(rejectedId => this._saveRejectedActivity(activity, rejectedId, errorData));
    }

    // The activity may be pushed, but the connection may be lost until we pull its latest change from AMP.
    // We could simply remove client-change-id once it is pushed successfully, but we want to use it in next iteration
    // for conflicts resolution. So for now we'll flag the activity as pushed to filter it out from next push attempt.
    activity[AC.IS_PUSHED] = true;
    activity[AC.ACTIVITY_GROUP] = pushResult[AC.ACTIVITY_GROUP];
    if (!activity[AC.AMP_ID]) {
      // update the activity with AMP ID to be matched during pull
      activity[AC.AMP_ID] = pushResult[AC.AMP_ID];
    }
    return ActivityHelper.saveOrUpdate(activity, false);
  }

  _updateDetails({ activity, pushResult, errorData }) {
    const detailType = errorData ? SYNCUP_DETAILS_UNSYNCED : SYNCUP_DETAILS_SYNCED;
    const detail = Utils.toMap(AC.PROJECT_TITLE, activity[AC.PROJECT_TITLE]);
    detail[AC.AMP_ID] = (pushResult && pushResult[AC.AMP_ID]) || activity[AC.AMP_ID];
    detail.id = (pushResult && pushResult[AC.INTERNAL_ID]) || activity.id;
    logger.log(`Activity push ${detailType} ${detail[AC.AMP_ID] || activity.id}`);
    this._details[detailType].push(detail);
  }

  _getRejectedId(activity) {
    logger.log('_getRejectedId');
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

  _saveRejectedActivity(activity, rejectedId, errorData) {
    const ampId = activity[AC.AMP_ID] ? `${activity[AC.AMP_ID]} ` : '';
    const idToLog = `${ampId}(${activity[AC.PROJECT_TITLE]})`;
    const fieldNameToLog = `${activity[AC.AMP_ID] ? AC.AMP_ID : ''}(${AC.PROJECT_TITLE})`;
    const prefix = `${idToLog}: `;
    let errors = errorData instanceof Array ? errorData : [errorData];
    const unitErrors = [];
    errors = errors.map(error => {
      let genericError;
      if (error instanceof Notification) {
        error.replacePairs = error.replacePairs || [];
        error.prefix = prefix;
        if (error.errorCode === EC.ERROR_CODE_NO_CONNECTIVITY) {
          genericError = error.shallowClone();
          genericError.prefix = '';
        }
      } else {
        error = `${prefix}${error}`;
      }
      unitErrors.push(genericError || error);
      return error;
    });
    logger.error(`_saveRejectActivity for ${fieldNameToLog} = ${idToLog} with rejectedId=${rejectedId}`);
    const rejectedActivity = activity;
    rejectedActivity[AC.REJECTED_ID] = rejectedId;
    rejectedActivity[AC.PROJECT_TITLE] = `${activity[AC.PROJECT_TITLE]}_${translate('Rejected')}${rejectedId}`;
    rejectedActivity.errors = errors;
    this.addErrors(unitErrors);
    return ActivityHelper.saveOrUpdate(rejectedActivity);
  }
}
