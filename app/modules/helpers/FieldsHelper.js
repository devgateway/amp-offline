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
    LoggerManager.log('findById');
    const filter = { id };
    return DatabaseManager.findOne(filter, COLLECTION_FIELDS);
  },

  /**
   * Find fields tree by workspace member
   * @param wsMemberId
   * @return {Promise}
   */
  findByWorkspaceMemberId(wsMemberId) {
    LoggerManager.log('findByWorkspaceMemberId');
    const filter = { 'ws-member-ids': { $elemMatch: wsMemberId } };
    return DatabaseManager.findOne(filter, COLLECTION_FIELDS);
  },

  /**
   * Find fields trees by filter criteria
   * @param filter the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAll(filter, projections) {
    LoggerManager.log('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_FIELDS, projections);
  },

  /**
   * Replace entire collection with new a new collection of fields trees
   * @param fieldsTrees
   * @return {Promise}
   */
  replaceAll(fieldsTrees) {
    LoggerManager.log('replaceAll');
    if (this._isValid(fieldsTrees)) {
      fieldsTrees.forEach(this._setIdIfUndefined);
      return DatabaseManager.replaceCollection(fieldsTrees, COLLECTION_FIELDS);
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
    LoggerManager.log('_setIdIfUndefined');
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
