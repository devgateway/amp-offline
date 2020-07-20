import { Constants, UIUtils } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Fields helper');

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
    logger.debug('findById');
    const filter = { id };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_FIELDS);
  },

  /**
   * Find fields tree by workspace member
   * @param wsMemberId
   * @param fieldsType
   * @return {Promise}
   */
  findByWorkspaceMemberIdAndType(wsMemberId, fieldsType) {
    logger.debug('findByWorkspaceMemberIdAndType');
    const filter = { 'ws-member-ids': { $elemMatch: wsMemberId } };
    filter[fieldsType] = { $exists: true };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_FIELDS);
  },

  findByWorkspaceIdAndTypeAndCollection(workspaceId, fieldsType) {
    logger.debug('findByWorkspaceIdAndType');
    const filter = { 'ws-member-ids': { $elemMatch: workspaceId } };
    filter[fieldsType] = { $exists: true };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_FIELDS);
  },

  /**
   * Find fields trees for specific fields type only
   * @param fieldsType fields type like 'activity-fields'
   * @param filter (optional) additional filter
   * @param projections (optional) set of fields to return
   * @return {Promise}
   */
  findAllPerFieldType(fieldsType, filter, projections) {
    logger.debug('findAllPerFieldType');
    filter = filter || {};
    filter[fieldsType] = { $exists: true };
    return FieldsHelper.findAll(filter, projections);
  },

  /**
   * Find the only available (if any) fields definition for the fields type or reports an error if multiple are found
   * @param fieldsType
   * @param filter
   * @param projections
   * @returns {Promise<T | never>}
   */
  getSingleFieldsDef(fieldsType, filter, projections) {
    return FieldsHelper.findAllPerFieldType(fieldsType, filter, projections).then(fieldDefs => {
      if (fieldDefs) {
        // Remove fields that could break the sync.
        fieldDefs.map(fd => {
          // delete fd.wsMemberIds;
          delete 'ws-member-ids';
          delete fd[fieldsType];
          return fd;
        });
        return fieldDefs;
      }
      return null;
    });
  },

  /**
   * Find fields trees by filter criteria
   * @param filter the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAll(filter, projections) {
    logger.debug('findAll');
    return DatabaseManager.findAll(filter, Constants.COLLECTION_FIELDS, projections);
  },

  /**
   * Replace entire collection with new a new collection of fields trees
   * @param fieldsTrees
   * @param fieldsType
   * @return {Promise}
   */
  replaceAllByFieldsType(fieldsTrees, fieldsType) {
    logger.log('replaceAllByFieldsType');
    if (this._isValid(fieldsTrees)) {
      fieldsTrees.forEach(this._setIdIfUndefined);
      const filter = Utils.toMap(fieldsType, { $exists: true });
      return DatabaseManager.replaceCollection(fieldsTrees, Constants.COLLECTION_FIELDS, filter);
    }
    return Promise.reject('Invalid Fields Tree structure. A workspace member must be linked to only one fields tree');
  },

  replaceAll(fieldsTrees) {
    logger.log('replaceAll');
    fieldsTrees.forEach(this._setIdIfUndefined);
    return DatabaseManager.replaceCollection(fieldsTrees, Constants.COLLECTION_FIELDS, { });
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
    logger.debug('_setIdIfUndefined');
    if (fields.id === undefined) {
      fields.id = UIUtils.stringToUniqueId('');
    }
  },

  /**
   * Delete a field tree by id
   * @param id
   * @return {Promise}
   */
  deleteById(id) {
    logger.log('deleteById');
    return DatabaseManager.removeById(id, Constants.COLLECTION_FIELDS);
  }
};

module.exports = FieldsHelper;
