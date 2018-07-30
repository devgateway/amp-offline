/* eslint object-shorthand:0 */
/* eslint func-names:0 */
import levenshtein from 'fast-levenshtein';
import * as DatabaseManager from '../database/DatabaseManager';
import Logger from '../util/LoggerManager';
import { COLLECTION_GAZETTEER, GAZETTEER_DISTANCE_DIVIDE } from '../../utils/Constants';
import * as Utils from '../../utils/Utils';

const logger = new Logger('Gazetteer helper');

const GazetteerHelper = {

  findLocationById(id) {
    logger.debug('findLocationById');
    const filterRule = { id };
    return GazetteerHelper.findLocation(filterRule);
  },

  findLocationByIds(ids) {
    logger.debug('findLocationByIds');
    const filterRule = { id: { $in: ids } };
    return GazetteerHelper.findAllLocations(filterRule);
  },

  findLocation(filterRule) {
    logger.debug('findLocation');
    return DatabaseManager.findOne(filterRule, COLLECTION_GAZETTEER);
  },

  findAllLocations(filterRule, projections) {
    logger.debug('findAllLocations');
    return DatabaseManager.findAll(filterRule, COLLECTION_GAZETTEER, projections);
  },

  findAllByNameFuzzy(name) {
    logger.debug('findAllByNameFuzzy');
    return DatabaseManager.findAll({
      // Note: dont use shorthand or "this" will have inconsistent values.
      $where: function () {
        const collator = { useCollator: true, sensitivity: 'base', ignorePunctuation: true };
        return (levenshtein.get(this.name, name, collator) <= GazetteerHelper._getDistance(name)
          || Utils.compareWithCollate(this.name, name, collator) === 0);
      }
    }, COLLECTION_GAZETTEER);
  },

  /**
   * Following AMP's logic we change the 'Levenshtein distance' according to the word length.
   * @param name
   * @returns {number}
   * @private
   */
  _getDistance(name) {
    const length = name.length;
    // Int part.
    return Math.trunc(length / GAZETTEER_DISTANCE_DIVIDE);
  },

  saveOrUpdateLocation(location) {
    logger.log('saveOrUpdateLocation');
    return DatabaseManager.saveOrUpdate(location.id, location, COLLECTION_GAZETTEER);
  },

  saveOrUpdateLocationCollection(locations) {
    logger.log('saveOrUpdateLocationCollection');
    return DatabaseManager.saveOrUpdateCollection(locations, COLLECTION_GAZETTEER);
  },

  deleteLocationById(id) {
    logger.log('deleteLocationById');
    return DatabaseManager.removeById(id, COLLECTION_GAZETTEER);
  },

  removeAllByIds(ids) {
    logger.log('removeAllByIds');
    const idsFilter = { id: { $in: ids } };
    return DatabaseManager.removeAll(idsFilter, COLLECTION_GAZETTEER);
  }
};

export default GazetteerHelper;
