import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_REPOSITORY } from '../../utils/Constants';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';
import { HASH } from '../../utils/constants/ResourceConstants';

const logger = new Logger('RepositoryHelper');

/**
 * A simplified helper to load/search/filter/save/delete repository content metadata.
 *
 * @author Nadejda Mandrescu
 */
const RepositoryHelper = {

  findContentById(id) {
    logger.debug('findContentById');
    const filterRule = { id };
    return RepositoryHelper.findContent(filterRule);
  },

  findContentByHash(hash) {
    logger.debug('findContentByHash');
    const filterRule = Utils.toMap(HASH, hash);
    return RepositoryHelper.findContent(filterRule);
  },

  findContent(filterRule) {
    logger.debug('findContent');
    return DatabaseManager.findOne(filterRule, COLLECTION_REPOSITORY);
  },

  findContentsByIds(ids) {
    logger.debug('findContentsByIds');
    const filterRule = { id: { $in: ids } };
    return RepositoryHelper.findAllContents(filterRule);
  },

  findAllContents(filterRule, projections) {
    logger.debug('findAllContents');
    return DatabaseManager.findAll(filterRule, COLLECTION_REPOSITORY, projections);
  },

  /**
   * Save content
   * @param content
   * @returns {Promise}
   */
  saveOrUpdateContent(content) {
    logger.log('saveOrUpdateContent');
    return DatabaseManager.saveOrUpdate(content.id, content, COLLECTION_REPOSITORY);
  },

  saveOrUpdateContentCollection(contents) {
    logger.log('saveOrUpdateContentCollection');
    return DatabaseManager.saveOrUpdateCollection(contents, COLLECTION_REPOSITORY);
  },

  replaceContents(contents) {
    logger.log('replaceContents');
    return DatabaseManager.replaceCollection(contents, COLLECTION_REPOSITORY);
  },

  /**
   * Remove the content by id
   * @param id
   * @returns {Promise}
   */
  deleteContentById(id) {
    logger.log('deleteContentById');
    return DatabaseManager.removeById(id, COLLECTION_REPOSITORY);
  },

  removeAllByIds(ids) {
    logger.log('removeAllByIds');
    const idsFilter = { id: { $in: ids } };
    return DatabaseManager.removeAll(idsFilter, COLLECTION_REPOSITORY);
  }
};

export default RepositoryHelper;
