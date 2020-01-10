import { Constants } from 'amp-ui';
import DatabaseManager from '../database/DatabaseManager';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Language helper');

/**
 * We use this class not like a DAO but for having functions that can be reused on several Manager classes.
 * Since we use a NoSQL database we dont have a fixed data structure so this is not a place to define fields.
 */
const LanguageHelper = {

  findById(id) {
    logger.log('findById');
    const example = { id };
    return this.findByExample(example);
  },

  findByExample(example) {
    logger.log('findByExample');
    return DatabaseManager.findOne(example, Constants.COLLECTION_LANGS);
  },

  findAllByExample(example) {
    logger.log('findAllByExample');
    return DatabaseManager.findAll(example, Constants.COLLECTION_LANGS);
  },

  saveOrUpdate(data) {
    logger.log('saveOrUpdate');
    return DatabaseManager.saveOrUpdate(data.id, data, Constants.COLLECTION_LANGS, {});
  },

  saveOrUpdateCollection(data) {
    logger.log('saveOrUpdateCollection');
    return DatabaseManager.saveOrUpdateCollection(data, Constants.COLLECTION_LANGS);
  },

  replaceCollection(langs) {
    logger.log('replaceCollection');
    return DatabaseManager.replaceCollection(langs, Constants.COLLECTION_LANGS);
  }
};

module.exports = LanguageHelper;
