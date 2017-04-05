/* eslint func-names: 0 */
import _ from 'underscore';
import BluebirdQueue from 'bluebird-queue';
import LoggerManager from '../../modules/util/LoggerManager';

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
        LoggerManager.log('checkIfCollectionIsOpen');
        const list = _.find(collections, (item) => item.name === name);
        LoggerManager.log(list);
        return list;
      },

      insertCollection(name, datastore) {
        LoggerManager.log('insertCollection');
        collections.push({ name, nedbDatastore: datastore });
        LoggerManager.debug(collections);
      },

      removeCollection(name) {
        LoggerManager.log('removeCollection');
        collections = _.without(collections, _.findWhere(collections, { name }));
        LoggerManager.debug(collections);
      },

      /**
       * Execute one database operation at the time.
       * @param task
       * @param resolve
       * @param reject
       */
      addPromiseAndProcess(task) {
        LoggerManager.log('addPromiseAndProcess');
        queue.addNow(task);
      }
    };
  }

  return {
    getInstance() {
      LoggerManager.log('getInstance');
      if (!instance) {
        LoggerManager.log('New instance.');
        instance = init();
      } else {
        LoggerManager.log('Reuse instance.');
      }
      return instance;
    },

    constructor() {
      LoggerManager.log('constructor');
      return false;
    }
  };
}());

module.exports = DatabaseCollection;
