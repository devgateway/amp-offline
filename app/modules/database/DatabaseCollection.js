import _ from 'underscore';

// https://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript
const DatabaseCollection = (function () {

  // Instance stores a reference to the Singleton
  let instance;

  function init() {

    let collections = new Array();

    return {
      // Public methods and variables
      checkIfCollectionIsOpen: function (name) {
        console.log('checkIfCollectionIsOpen');
        let list = _.find(collections, function (item) {
          return item.name === name;
        });
        console.log(list);
        return list;
      },

      insertCollection: function (name, datastore) {
        console.log('insertCollection');
        collections.push({name: name, nedbDatastore: datastore});
        console.log(collections);
      },

      removeCollection: function (name) {
        console.log('removeCollection');
        collections = _.without(collections, _.findWhere(collections, {name: name}));
        console.log(collections);
      }
    };
  }

  return {
    getInstance: function () {
      console.log('getInstance');
      if (!instance) {
        console.log('New instance.');
        instance = init();
      } else {
        console.log('Reuse instance.');
      }
      return instance;
    },

    constructor: function () {
      console.log('constructor');
      return false;
    }
  };
})();

module.exports = DatabaseCollection;
