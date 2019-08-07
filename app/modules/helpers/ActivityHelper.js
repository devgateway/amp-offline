import { Constants } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import * as AC from '../../utils/constants/ActivityConstants';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Activity helper');

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
    logger.debug('findNonRejectedById');
    const filter = { $and: [this._getNonRejectedRule(), { id }] };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity by internal id
   * @param internalId that is "internal_id" in API and "amp_activity_id" in AMP DB
   * @return {Promise}
   */
  findNonRejectedByInternalId(internalId) {
    logger.debug('findNonRejectedByInternalId');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.INTERNAL_ID, internalId)] };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity version by amp_id
   * @param ampId activity amp_id in AMP DB
   * @return {Promise}
   */
  findNonRejectedByAmpId(ampId) {
    logger.debug('findNonRejectedByAmpId');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.AMP_ID, ampId)] };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_ACTIVITIES);
  },

  /**
   * Find non rejected activity version by project title
   * @param projectTitle activity title
   * @return {Promise}
   */
  findNonRejectedByProjectTitle(projectTitle) {
    logger.debug('findNonRejectedByProjectTitle');
    const filter = { $and: [this._getNonRejectedRule(), Utils.toMap(AC.PROJECT_TITLE, projectTitle)] };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_ACTIVITIES);
  },

  findAllNonRejectedByAmpIds(ampIds) {
    return this.findAllNonRejected(Utils.toMap(AC.AMP_ID, { $in: ampIds }));
  },

  /**
   * Find all non rejected activities that meet the search criteria
   * @param filterRule
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAllNonRejected(filterRule, projections) {
    const filter = { $and: [this._getNonRejectedRule(), filterRule] };
    return DatabaseManager.findAll(filter, Constants.COLLECTION_ACTIVITIES, projections);
  },

  findAllNonRejectedModifiedOnClient(filterRule, projections) {
    const filter = {
      $and: [this._getNonRejectedRule(), this._getModifiedOnClientSide(), this._getNotPushed(), filterRule]
    };
    return DatabaseManager.findAll(filter, Constants.COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Find all rejected activities by amp id
   * @param ampId activity amp_id in AMP DB
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAllRejectedByAmpId(ampId, projections) {
    logger.debug('findAllRejectedByAmpId');
    const filter = { $and: [this._getRejectedRule(), Utils.toMap(AC.AMP_ID, ampId)] };
    return DatabaseManager.findAll(filter, Constants.COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Find all rejected activities that meet the filter criteria
   * @param filterRule the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAllRejected(filterRule, projections) {
    logger.debug('findAllRejected');
    const filter = { $and: [this._getRejectedRule(), filterRule] };
    return DatabaseManager.findAll(filter, Constants.COLLECTION_ACTIVITIES, projections);
  },

  /**
   * Find all activities (rejected or not) that meet a certain filter criteria
   * @param filterRule the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAll(filterRule, projections) {
    logger.debug('findAll');
    return DatabaseManager.findAll(filterRule, Constants.COLLECTION_ACTIVITIES, projections);
  },

  count(filterRule) {
    logger.debug('findAll');
    return DatabaseManager.count(filterRule, Constants.COLLECTION_ACTIVITIES);
  },

  /**
   * Get all unique existing amp-ids
   * @return {Promise.<Set>|*}
   */
  getUniqueAmpIdsList() {
    return ActivityHelper.findAllNonRejected(Utils.toDefinedNotNullRule(AC.AMP_ID), Utils.toMap(AC.AMP_ID, 1)).then(
      ampIds => new Set(Utils.flattenToListByKey(ampIds, AC.AMP_ID)));
  },

  /**
   * Saves the new activity or updates the existing
   * @param activity
   * @param isDiffChange if this is a difference compared to AMP and should be tracked with new client change id
   * @return {Promise}
   */
  saveOrUpdate(activity, isDiffChange) {
    logger.log('saveOrUpdate');
    this._setOrUpdateIds(activity, isDiffChange);
    return DatabaseManager.saveOrUpdate(activity.id, activity, Constants.COLLECTION_ACTIVITIES);
  },

  _setOrUpdateIds(activity, isDiffChange = false) {
    logger.debug('_setOrUpdateIds');
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
      if (isDiffChange) {
        activity[AC.CLIENT_CHANGE_ID] = Utils.stringToUniqueId(activity[AC.PROJECT_TITLE]);
      }
      if (activity[AC.REJECTED_ID]) {
        activity.id = `${activity.id}-${activity[AC.CLIENT_CHANGE_ID]}`;
      }
    }
    // any other logic like cleanup of existing activity during sync up must be done by the calling module
  },

  /**
   * Saves a collection of activities
   * @param activities
   * @param isDiffChange if this is a difference compared to AMP and should be tracked with new client change id
   * @return {Promise}
   */
  saveOrUpdateCollection(activities, isDiffChange) {
    logger.log('saveOrUpdateCollection');
    activities.forEach(a => this._setOrUpdateIds(a, isDiffChange));
    return DatabaseManager.saveOrUpdateCollection(activities, Constants.COLLECTION_ACTIVITIES);
  },

  /**
   * Replace all activities with a new collection of activities
   * @param activities
   * @return {Promise}
   */
  replaceAll(activities) {
    logger.log('replaceAll');
    activities.forEach(this._setOrUpdateIds);
    return DatabaseManager.replaceCollection(activities, Constants.COLLECTION_ACTIVITIES);
  },

  removeNonRejectedById(id) {
    logger.log('removeNonRejectedById');
    return DatabaseManager.removeById(id, Constants.COLLECTION_ACTIVITIES, this._getNonRejectedRule());
  },

  removeNonRejectedByAmpId(ampId) {
    logger.log('removeNonRejectedByAmpId');
    return this.findNonRejectedByAmpId(ampId).then(result => {
      if (result === null) {
        return null;
      }
      return DatabaseManager.removeById(result.id, Constants.COLLECTION_ACTIVITIES, this._getNonRejectedRule());
    });
  },

  removeRejected(id) {
    logger.log('removeRejected');
    return DatabaseManager.removeById(id, Constants.COLLECTION_ACTIVITIES, this._getRejectedRule());
  },

  removeAllNonRejectedByIds(ids) {
    logger.log('removeAllNonRejectedByIds');
    const filter = { $and: [this._getNonRejectedRule(), { id: { $in: ids } }] };
    return this.removeAll(filter);
  },

  removeAll(filter) {
    logger.log('removeAll');
    return DatabaseManager.removeAll(filter, Constants.COLLECTION_ACTIVITIES);
  },

  getVersion(activity) {
    if (activity && activity[AC.ACTIVITY_GROUP]) {
      return activity[AC.ACTIVITY_GROUP][AC.VERSION];
    }
    return null;
  },

  isModifiedOnClient(activity) {
    return activity && activity[AC.CLIENT_CHANGE_ID] && !activity[AC.IS_PUSHED];
  },

  _getModifiedOnClientSide() {
    return Utils.toMap(AC.CLIENT_CHANGE_ID, { $exists: true });
  },

  _getNotPushed() {
    // search where IS_PUSHED is set to see why
    return Utils.toMap(AC.IS_PUSHED, { $ne: true });
  },

  _getNonRejectedRule() {
    return Utils.toMap(AC.REJECTED_ID, { $exists: false });
  },

  _getRejectedRule() {
    return Utils.toMap(AC.REJECTED_ID, { $exists: true });
  }
};

module.exports = ActivityHelper;
