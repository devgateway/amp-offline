import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_ACTIVITIES } from '../../utils/Constants';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * A simplified helper for using activities storage for loading, searching / filtering, saving and deleting activities.
 * @author Nadejda Mandrescu
 */
const ActivityHelper = {

  /**
   * Find non rejected activity version by activity id, using "id" field.
   * Note that "internal_id" can be undefined for new local activities.
   * @param id activity local temporary id or remove id that is "internal_id" in API and "amp_activity_id" in AMP DB
   * @return {Promise}
   */
  findNonRejectedById(id) {
    LoggerManager.log('findNonRejectedById');
    const filter = { $and: [this._getNonRejectedRule(), { id }] };
    return DatabaseManager.findOne(filter, COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity by internal id
   * @param internalId that is "internal_id" in API and "amp_activity_id" in AMP DB
   * @return {Promise}
   */
  findNonRejectedByInternalId(internalId) {
    LoggerManager.log('findNonRejectedByInternalId');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.INTERNAL_ID, internalId)] };
    return DatabaseManager.findOne(filter, COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity version by amp_id
   * @param ampId activity amp_id in AMP DB
   * @return {Promise}
   */
  findNonRejectedByAmpId(ampId) {
    LoggerManager.log('findNonRejectedByAmpId');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.AMP_ID, ampId)] };
    return DatabaseManager.findOne(filter, COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity version by project title
   * @param projectTitle activity title
   * @return {Promise}
   */
  findNonRejectedByProjectTitle(projectTitle) {
    LoggerManager.log('findNonRejectedByProjectTitle');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.PROJECT_TITLE, projectTitle)] };
    return DatabaseManager.findOne(filter, COLLECTION_ACTIVITIES);
  },

  /**
   * Find all non rejected activities that meet the search criteria
   * @param filterRule
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAllNonRejected(filterRule, projections) {
    const filter = { $and: [this._getNonRejectedRule(), filterRule] };
    return DatabaseManager.findAll(filter, COLLECTION_ACTIVITIES, projections);
  },

  findAllNonRejectedModifiedOnClient(filterRule, projections) {
    const filter = { $and: [this._getNonRejectedRule(), this._getModifiedOnClientSide(), filterRule] };
    return DatabaseManager.findAll(filter, COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Find all rejected activities by amp id
   * @param ampId activity amp_id in AMP DB
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAllRejectedByAmpId(ampId, projections) {
    LoggerManager.log('findAllRejectedByAmpId');
    const filter = { $and: [this._getRejectedRule(), Utils.toMap(AC.AMP_ID, ampId)] };
    return DatabaseManager.findAll(filter, COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Find all rejected activities that meet the filter criteria
   * @param filterRule the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAllRejected(filterRule, projections) {
    LoggerManager.log('findAllRejected');
    const filter = { $and: [this._getRejectedRule(), filterRule] };
    return DatabaseManager.findAll(filter, COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Find all activities (rejected or not) that meet a certain filter criteria
   * @param filterRule the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAll(filterRule, projections) {
    LoggerManager.log('findAll');
    return DatabaseManager.findAll(filterRule, COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Saves the new activity or updates the existing
   * @param activity
   * @return {Promise}
   */
  saveOrUpdate(activity) {
    LoggerManager.log('saveOrUpdate');
    this._setOrUpdateIds(activity);
    return DatabaseManager.saveOrUpdate(activity.id, activity, COLLECTION_ACTIVITIES);
  },

  _setOrUpdateIds(activity) {
    LoggerManager.log('_setOrUpdateIds');
    // if this activity version is not yet available offline
    if (activity.id === undefined) {
      // set id to internal_id (== activity comes from sync) or generate a new local id (== activity created offline)
      if (activity[AC.INTERNAL_ID]) {
        // set the id as string for consistency with other use cases
        activity.id = `${activity[AC.INTERNAL_ID]}`;
      } else {
        activity.id = Utils.stringToUniqueId(activity[AC.PROJECT_TITLE]);
        // also flag activity changed on the client side
        activity[AC.CLIENT_CHANGE_ID] = activity.id;
      }
    } else {
      activity[AC.CLIENT_CHANGE_ID] = Utils.stringToUniqueId(activity[AC.PROJECT_TITLE]);
      if (activity[AC.REJECTED_ID]) {
        activity.id = `${activity.id}-${activity[AC.CLIENT_CHANGE_ID]}`;
      }
    }
    // any other logic like cleanup of existing activity during sync up must be done by the calling module
  },

  /**
   * Saves a collection of activities
   * @param activities
   * @return {Promise}
   */
  saveOrUpdateCollection(activities) {
    LoggerManager.log('saveOrUpdateCollection');
    activities.forEach(this._setOrUpdateIds);
    return DatabaseManager.saveOrUpdateCollection(activities, COLLECTION_ACTIVITIES);
  },

  /**
   * Replace all activities with a new collection of activities
   * @param activities
   * @return {Promise}
   */
  replaceAll(activities) {
    LoggerManager.log('replaceAll');
    activities.forEach(this._setOrUpdateIds);
    return DatabaseManager.replaceCollection(activities, COLLECTION_ACTIVITIES);
  },

  removeNonRejectedById(id) {
    LoggerManager.log('removeNonRejectedById');
    return DatabaseManager.removeById(id, COLLECTION_ACTIVITIES, this._getNonRejectedRule());
  },

  removeNonRejectedByAmpId(ampId) {
    LoggerManager.log('removeNonRejectedByAmpId');
    return new Promise((resolve, reject) =>
      this.findNonRejectedByAmpId(ampId).then(result => {
        if (result === null) {
          return resolve(null);
        }
        return DatabaseManager.removeById(result.id, COLLECTION_ACTIVITIES, this._getNonRejectedRule())
          .then(resolve).catch(reject);
      }).catch(reject)
    );
  },

  removeRejected(id) {
    LoggerManager.log('removeRejected');
    return DatabaseManager.removeById(id, COLLECTION_ACTIVITIES, this._getRejectedRule());
  },

  removeAll(filter) {
    LoggerManager.log('removeAll');
    return DatabaseManager.removeAll(filter, COLLECTION_ACTIVITIES);
  },

  _getModifiedOnClientSide() {
    return Utils.toMap(AC.CLIENT_CHANGE_ID, { $exists: true });
  },

  _getNonRejectedRule() {
    return Utils.toMap(AC.REJECTED_ID, { $exists: false });
  },

  _getRejectedRule() {
    return Utils.toMap(AC.REJECTED_ID, { $exists: true });
  }
};

module.exports = ActivityHelper;
