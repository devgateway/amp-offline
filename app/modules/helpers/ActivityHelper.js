import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_ACTIVITIES } from '../../utils/Constants';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';

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
    console.log('findNonRejectedById');
    const filter = { $and: [this._getNonRejectedRule(), { id }] };
    return DatabaseManager.findOne(filter, COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity by internal id
   * @param internalId that is "internal_id" in API and "amp_activity_id" in AMP DB
   * @return {Promise}
   */
  findNonRejectedByInternalId(internalId) {
    console.log('findNonRejectedByInternalId');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.INTERNAL_ID, internalId)] };
    return DatabaseManager.findOne(filter, COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity version by amp_id
   * @param ampId activity amp_id in AMP DB
   * @return {Promise}
   */
  findNonRejectedByAmpId(ampId) {
    console.log('findNonRejectedByAmpId');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.AMP_ID, ampId)] };
    return DatabaseManager.findOne(filter, COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity version by project title
   * @param projectTitle activity title
   * @return {Promise}
   */
  findNonRejectedByProjectTitle(projectTitle) {
    console.log('findNonRejectedByProjectTitle');
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

  /**
   * Find all rejected activities by amp id
   * @param ampId activity amp_id in AMP DB
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAllRejectedByAmpId(ampId, projections) {
    console.log('findAllRejectedByAmpId');
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
    console.log('findAllRejected');
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
    console.log('findAll');
    return DatabaseManager.findAll(filterRule, COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Saves the new activity or updates the existing
   * @param activity
   * @return {Promise}
   */
  saveOrUpdate(activity) {
    console.log('saveOrUpdate');
    this._setIdIfUndefined(activity);
    return DatabaseManager.saveOrUpdate(activity.id, activity, COLLECTION_ACTIVITIES);
  },

  _setIdIfUndefined(activity) {
    console.log('_setIdIfUndefined');
    /* eslint-disable no-param-reassign */
    // if this activity version is not yet available offline
    if (activity.id === undefined) {
      // set id to internal_id (== activity comes from sync) or generate a new local id (== activity created offline)
      if (activity[AC.INTERNAL_ID]) {
        activity.id = activity[AC.INTERNAL_ID];
      } else {
        activity.id = Utils.stringToUniqueId(activity[AC.PROJECT_TITLE]);
      }
    }
    // any other logic like cleanup of existing activity during sync up must be done by the calling module
    /* eslint-enable no-param-reassign */
  },

  /**
   * Saves a collection of activities
   * @param activities
   * @return {Promise}
   */
  saveOrUpdateCollection(activities) {
    console.log('saveOrUpdateCollection');
    activities.forEach(this._setIdIfUndefined);
    return DatabaseManager.saveOrUpdateCollection(activities, COLLECTION_ACTIVITIES);
  },

  /**
   * Replace all activities with a new collection of activities
   * @param activities
   * @return {Promise}
   */
  replaceAll(activities) {
    console.log('replaceAll');
    activities.forEach(this._setIdIfUndefined);
    return DatabaseManager.replaceCollection(activities, COLLECTION_ACTIVITIES);
  },

  removeNonRejectedById(id) {
    console.log('removeNonRejectedById');
    return DatabaseManager.removeById(id, COLLECTION_ACTIVITIES, this._getNonRejectedRule());
  },

  removeNonRejectedByAmpId(ampId) {
    console.log('removeNonRejectedByAmpId');
    return new Promise((resolve, reject) =>
      this.findNonRejectedByAmpId(ampId).then(result => {
        if (result === null) {
          return resolve(null);
        }
        return DatabaseManager.removeById(result.id, COLLECTION_ACTIVITIES, this._getNonRejectedRule());
      }).catch(reject)
    );
  },

  removeRejected(id) {
    console.log('removeRejected');
    return DatabaseManager.removeById(id, COLLECTION_ACTIVITIES, this._getRejectedRule());
  },

  removeAll(filter) {
    console.log('removeAll');
    return DatabaseManager.removeAll(filter, COLLECTION_ACTIVITIES);
  },

  _getNonRejectedRule() {
    return Utils.toMap(AC.REJECTED_ID, { $exists: false });
  },

  _getRejectedRule() {
    return Utils.toMap(AC.REJECTED_ID, { $exists: true });
  }
};

module.exports = ActivityHelper;
