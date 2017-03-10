import _ from 'underscore';
import BluebirdQueue from 'bluebird-queue';

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
        console.log('checkIfCollectionIsOpen');
        const list = _.find(collections, (item) => item.name === name);
        console.log(list);
        return list;
      },

      insertCollection(name, datastore) {
        console.log('insertCollection');
        collections.push({ name, nedbDatastore: datastore });
        console.log(collections);
      },

      removeCollection(name) {
        console.log('removeCollection');
        collections = _.without(collections, _.findWhere(collections, { name }));
        console.log(collections);
      },

      /**
       * Execute one database operation at the time.
       * @param task
       * @param resolve
       * @param reject
       */
      addPromiseAndProcess(task) {
        console.log('addPromiseAndProcess');
        queue.addNow(task);
      }
    };
  }

  return {
    getInstance() {
      console.log('getInstance');
      if (!instance) {
        console.log('New instance.');
        instance = init();
      } else {
        console.log('Reuse instance.');
      }
      return instance;
    },

    constructor() {
      console.log('constructor');
      return false;
    }
  };
}());

module.exports = DatabaseCollection;
