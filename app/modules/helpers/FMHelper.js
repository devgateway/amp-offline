import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_FEATURE_MANAGER } from '../../utils/Constants';
import * as Utils from '../../utils/Utils';
import LoggerManager from '../../modules/util/LoggerManager';

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
    LoggerManager.log('findById');
    const filter = { id };
    return DatabaseManager.findOne(filter, COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Find all FM trees
   * @param filterRule the filter criteria
   * @param projections optional set of fields to return
   * @return {Promise}
   */
  findAll(filterRule, projections) {
    LoggerManager.log('findAll');
    return DatabaseManager.findAll(filterRule, COLLECTION_FEATURE_MANAGER, projections);
  },

  /**
   * Saves a new fmTree or updates the existing one
   * @param fmTree
   * @return {Promise}
   */
  saveOrUpdate(fmTree) {
    LoggerManager.log('saveOrUpdate');
    this._setIdIfNotDefined([fmTree]);
    return DatabaseManager.saveOrUpdate(fmTree.id, fmTree, COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Saves a collection of fmTrees
   * @param fmTrees
   * @return {Promise}
   */
  saveOrUpdateCollection(fmTrees) {
    LoggerManager.log('saveOrUpdateCollection');
    this._setIdIfNotDefined(fmTrees);
    return DatabaseManager.saveOrUpdateCollection(fmTrees, COLLECTION_FEATURE_MANAGER);
  },

  _setIdIfNotDefined(fmTrees) {
    // when we'll be using multiple trees, we'll likely change EP to provide the id as well
    fmTrees.forEach(fm => {
      if (!fm.id) {
        fm.id = Utils.stringToUniqueId('');
      }
    });
  },

  /**
   * Replace all fmTrees with a new collection of fmTrees
   * @param fmTrees
   * @return {Promise}
   */
  replaceAll(fmTrees) {
    LoggerManager.log('replaceAll');
    return DatabaseManager.replaceCollection(fmTrees, COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Removes an FM tree by id
   * @param id fm tree id
   * @return {Promise}
   */
  removeById(id) {
    LoggerManager.log('removeById');
    return DatabaseManager.removeById(id, COLLECTION_FEATURE_MANAGER);
  },

  /**
   * Removes FM trees that match filter criteria
   * @param filter the criteria to match FM trees to remove
   * @return {Promise}
   */
  removeAll(filter) {
    LoggerManager.log('removeAll');
    return DatabaseManager.removeAll(filter, COLLECTION_FEATURE_MANAGER);
  }
};

export default FMHelper;
