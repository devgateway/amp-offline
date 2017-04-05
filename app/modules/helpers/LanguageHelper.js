import DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_LANGS } from '../../utils/Constants';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * We use this class not like a DAO but for having functions that can be reused on several Manager classes.
 * Since we use a NoSQL database we dont have a fixed data structure so this is not a place to define fields.
 */
const LanguageHelper = {

  findById(id) {
    LoggerManager.log('findById');
    const example = { id };
    return this.findByExample(example);
  },

  findByExample(example) {
    LoggerManager.log('findByExample');
    return DatabaseManager.findOne(example, COLLECTION_LANGS);
  },

  findAllByExample(example) {
    LoggerManager.log('findAllByExample');
    return DatabaseManager.findAll(example, COLLECTION_LANGS);
  },

  saveOrUpdate(data) {
    LoggerManager.log('saveOrUpdate');
    return DatabaseManager.saveOrUpdate(data.id, data, COLLECTION_LANGS, {});
  },

  saveOrUpdateCollection(data) {
    LoggerManager.log('saveOrUpdateCollection');
    return DatabaseManager.saveOrUpdateCollection(data, COLLECTION_LANGS);
  },

  replaceCollection(langs) {
    LoggerManager.log('replaceCollection');
    return DatabaseManager.replaceCollection(langs, COLLECTION_LANGS);
  }
};

module.exports = LanguageHelper;
