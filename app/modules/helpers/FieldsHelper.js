import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_FIELDS } from '../../utils/Constants';
import * as Utils from '../../utils/Utils';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * A simplified helper for 'Workspace Settings' storage for loading, searching / filtering and saving ws settings.
 * @author Nadejda Mandrescu
 */
const FieldsHelper = {
  /**
   * Find fields tree by id
   * @param id
   * @return {Promise}
   */
  findById(id) {
    LoggerManager.debug('findById');
    const filter = { id };
    return DatabaseManager.findOne(filter, COLLECTION_FIELDS);
  },

  /**
   * Find fields tree by workspace member
   * @param wsMemberId
   * @param fieldsType
   * @return {Promise}
   */
  findByWorkspaceMemberIdAndType(wsMemberId, fieldsType) {
    LoggerManager.debug('findByWorkspaceMemberIdAndType');
    const filter = { 'ws-member-ids': { $elemMatch: wsMemberId } };
    filter[fieldsType] = { $exists: true };
    return DatabaseManager.findOne(filter, COLLECTION_FIELDS);
  },

  /**
   * Find fields trees for specific fields type only
   * @param fieldsType fields type like 'activity-fields'
   * @param filter (optional) additional filter
   * @param projections (optional) set of fields to return
   * @return {Promise}
   */
  findAllPerFieldType(fieldsType, filter, projections) {
    LoggerManager.debug('findAllPerFieldType');
    filter = filter || {};
    filter[fieldsType] = { $exists: true };
    return FieldsHelper.findAll(filter, projections);
  },

  /**
   * Find fields trees by filter criteria
   * @param filter the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAll(filter, projections) {
    LoggerManager.debug('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_FIELDS, projections);
  },

  /**
   * Replace entire collection with new a new collection of fields trees
   * @param fieldsTrees
   * @param fieldsType
   * @return {Promise}
   */
  replaceAllByFieldsType(fieldsTrees, fieldsType) {
    LoggerManager.log('replaceAll');
    if (this._isValid(fieldsTrees)) {
      fieldsTrees.forEach(this._setIdIfUndefined);
      const filter = Utils.toMap(fieldsType, { $exists: true });
      return DatabaseManager.replaceCollection(fieldsTrees, COLLECTION_FIELDS, filter);
    }
    return Promise.reject('Invalid Fields Tree structure. A workspace member must be linked to only one fields tree');
  },

  _isValid(fieldsTrees) {
    const merged = {
      count: 0,
      wsMemberIds: new Set()
    };
    if (fieldsTrees.length > 1) {
      for (let i = 0; i < fieldsTrees.length; i++) {
        merged.count += fieldsTrees[i]['ws-member-ids'].length;
        merged.wsMemberIds = new Set([...merged.wsMemberIds, ...fieldsTrees[i]['ws-member-ids']]);
      }
    }
    return merged.count === merged.wsMemberIds.size;
  },

  _setIdIfUndefined(fields) {
    LoggerManager.debug('_setIdIfUndefined');
    if (fields.id === undefined) {
      fields.id = Utils.stringToUniqueId('');
    }
  },

  /**
   * Delete a field tree by id
   * @param id
   * @return {Promise}
   */
  deleteById(id) {
    LoggerManager.log('deleteById');
    return DatabaseManager.removeById(id, COLLECTION_FIELDS);
  }
};

module.exports = FieldsHelper;
