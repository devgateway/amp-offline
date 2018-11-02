import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CHANGESETS } from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';

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
  }
};

export default ChangesetHelper;
