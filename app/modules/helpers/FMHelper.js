import { Constants, UIUtils } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('FM Helper');

/**
 * A simplified helper for using Feature Manager storage for loading, searching, saving and deleting FM entries.
 * @author Nadejda Mandrescu
 */
const FMHelper = {

  /**
   * Find FM tree by id
   * @param id FM id
   * @return {Promise}
   */
  findById(id) {
    logger.log('findById');
    const filter = { id };
    return DatabaseManager.findOne(filter, Constants.COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Find all FM trees
   * @param filterRule the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAll(filterRule, projections) {
    logger.log('findAll');
    return DatabaseManager.findAll(filterRule, Constants.COLLECTION_FEATURE_MANAGER, projections);
  },

  /**
   * Saves a new fmTree or updates the existing one
   * @param fmTree
   * @return {Promise}
   */
  saveOrUpdate(fmTree) {
    logger.log('saveOrUpdate');
    this._setIdIfNotDefined([fmTree]);
    return DatabaseManager.saveOrUpdate(fmTree.id, fmTree, Constants.COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Saves a collection of fmTrees
   * @param fmTrees
   * @return {Promise}
   */
  saveOrUpdateCollection(fmTrees) {
    logger.log('saveOrUpdateCollection');
    this._setIdIfNotDefined(fmTrees);
    return DatabaseManager.saveOrUpdateCollection(fmTrees, Constants.COLLECTION_FEATURE_MANAGER);
  },

  _setIdIfNotDefined(fmTrees) {
    // when we'll be using multiple trees, we'll likely change EP to provide the id as well
    fmTrees.forEach(fm => {
      if (!fm.id) {
        fm.id = UIUtils.stringToUniqueId('');
      }
    });
  },

  /**
   * Replace all fmTrees with a new collection of fmTrees
   * @param fmTrees
   * @return {Promise}
   */
  replaceAll(fmTrees) {
    logger.log('replaceAll');
    return DatabaseManager.replaceCollection(fmTrees, Constants.COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Removes an FM tree by id
   * @param id fm tree id
   * @return {Promise}
   */
  removeById(id) {
    logger.log('removeById');
    return DatabaseManager.removeById(id, Constants.COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Removes FM trees that match filter criteria
   * @param filter the criteria to match FM trees to remove
   * @return {Promise}
   */
  removeAll(filter) {
    logger.log('removeAll');
    return DatabaseManager.removeAll(filter, Constants.COLLECTION_FEATURE_MANAGER);
  }
};

export default FMHelper;
