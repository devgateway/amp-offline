/* eslint func-names: 0 */
import _ from 'underscore';
import BluebirdQueue from 'bluebird-queue';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Database connection');

// https://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript
const DatabaseCollection = (function () {
  // Instance stores a reference to the Singleton
  let instance;

  function init() {
    let collections = [];
    const queue = new BluebirdQueue({ concurrency: 1 });

    return {
      // Public methods and variables
      checkIfCollectionIsOpen(name) {
        logger.debug('checkIfCollectionIsOpen');
        const list = _.find(collections, (item) => item.name === name);
        logger.debug(list);
        return list;
      },

      insertCollection(name, datastore) {
        logger.debug('insertCollection');
        collections.push({ name, nedbDatastore: datastore });
        logger.debug(collections);
      },

      removeCollection(name) {
        logger.debug('removeCollection');
        collections = _.without(collections, _.findWhere(collections, { name }));
        logger.debug(collections);
      },

      /**
       * Execute one database operation at the time.
       * @param task
       * @param resolve
       * @param reject
       */
      addPromiseAndProcess(task) {
        logger.debug('addPromiseAndProcess');
        queue.addNow(task);
      }
    };
  }

  return {
    getInstance() {
      logger.debug('getInstance');
      if (!instance) {
        logger.log('New instance.');
        instance = init();
      } else {
        logger.debug('Reuse instance.');
      }
      return instance;
    },

    constructor() {
      logger.log('constructor');
      return false;
    }
  };
}());

module.exports = DatabaseCollection;
