import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CHANGESETS } from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';
import Changeset from '../database/migrations/Changeset';
import * as MC from '../../utils/constants/MigrationsConstants';
import * as Utils from '../../utils/Utils';

const logger = new Logger('ChangesetHelper');

/**
 * A simplified helper for using changesets storage for loading, searching / filtering, saving and deleting changesets.
 *
 * @author Nadejda Mandrescu
 */
const ChangesetHelper = {

  findChangesetById(id) {
    logger.debug('findChangesetById');
    const filterRule = { id };
    return ChangesetHelper.findChangeset(filterRule);
  },

  findChangesetsByIds(ids) {
    logger.debug('findChangesetsByIds');
    const filterRule = { id: { $in: ids } };
    return ChangesetHelper.findAllChangesets(filterRule);
  },

  findChangeset(filterRule) {
    logger.debug('findChangeset');
    return DatabaseManager.findOne(filterRule, COLLECTION_CHANGESETS);
  },

  findAllChangesets(filterRule, projections) {
    logger.debug('findAllChangesets');
    return DatabaseManager.findAll(filterRule, COLLECTION_CHANGESETS, projections);
  },

  /**
   * Save the changeset
   * @param changeset
   * @returns {Promise}
   */
  saveOrUpdateChangeset(changeset) {
    logger.log('saveOrUpdateChangeset');
    return DatabaseManager.saveOrUpdate(changeset.id, changeset, COLLECTION_CHANGESETS);
  },

  saveOrUpdateChangesetCollection(changesets) {
    logger.log('saveOrUpdateChangesetCollection');
    return DatabaseManager.saveOrUpdateCollection(changesets, COLLECTION_CHANGESETS);
  },

  replaceChangesets(changesets) {
    logger.log('replaceChangesets');
    return DatabaseManager.replaceCollection(changesets, COLLECTION_CHANGESETS);
  },

  /**
   * Remove the changeset by id
   * @param id
   * @returns {Promise}
   */
  deleteChangesetById(id) {
    logger.log('deleteChangesetById');
    return DatabaseManager.removeById(id, COLLECTION_CHANGESETS);
  },

  removeAllByIds(ids) {
    logger.log('removeAllByIds');
    const idsFilter = { id: { $in: ids } };
    return DatabaseManager.removeAll(idsFilter, COLLECTION_CHANGESETS);
  },

  removeAll() {
    return DatabaseManager.removeAll({}, COLLECTION_CHANGESETS);
  },

  /**
   * Runs the update according to update definition
   * @param updateDef the update definition object from the changeset
   * @return {Promise}
   */
  getUpdateFunc(updateDef) {
    const fieldsModifier = { $set: Utils.toMap(updateDef[MC.FIELD], updateDef[MC.VALUE]) };
    return DatabaseManager.updateCollectionFields(updateDef[MC.FILTER], fieldsModifier, updateDef[MC.TABLE]);
  },

  /**
   * Converts a changeset to DB format based taking from available information provided in the template
   * @param changeset the changeset to convert
   * @param template the set of known fields, that can come from existing DB data or newly configured
   */
  changesetToDBFormat(changeset: Changeset, template = {}) {
    const dbc = {
      id: changeset.id,
      [MC.CHANGEID]: changeset.changeId,
      [MC.AUTHOR]: changeset.author,
      [MC.FILENAME]: changeset.filename,
      [MC.CONTEXT]: changeset.execContext || changeset.context,
      [MC.COMMENT]: changeset.comment,
      [MC.ORDER_EXECUTED]: changeset.orderExecuted,
      [MC.EXECTYPE]: changeset.execType,
      [MC.DATE_EXECUTED]: changeset.dateExecuted,
      [MC.DATE_FOUND]: changeset.dateFound,
      [MC.ERROR]: changeset.error,
      [MC.ROLLBACKEXECTYPE]: changeset.rollbackExecType,
      [MC.ROLLBACKERROR]: changeset.rollbackError,
      ...template
    };
    dbc[MC.MD5SUM] = changeset.md5;
    if (!dbc[MC.EXECTYPE]) {
      dbc[MC.EXECTYPE] = MC.EXECTYPE_NOT_RUN;
    }
    return dbc;
  }
};

export default ChangesetHelper;
