import Datastore from 'nedb';

const fileNamePrefix = '/amp_offline/';
const fileNameExtension = '.db';

/**
 * TODO: this class should be part of an API to connect to different databases (like NeDB).
 * @type {{connect: ((name, callback, options)), disconnect: ((name, callback, options)), createCollection: ((name, callback, options)), destroyCollection: ((name, callback, options)), insert: ((object, callback, options)), remove: ((object, callback, options)), find: ((object, callback, options))}}
 */
const DatabaseManager = {

  createCollectionAndConnect(name, callback, options) {
    console.log('createCollectionAndConnect');
    const db = new Datastore({filename: fileNamePrefix + name + fileNameExtension});
    db.loadDatabase(function (err) {
      if (err !== undefined) {
        callback(false);
      } else {
        callback(true, db);
      }
    });
  },

  insert(object, callback, options) {
    console.log('insert');
    callback(true);
  },

  remove(object, callback, options) {
    console.log('remove');
    callback(true);
  },

  find(object, callback, options) {
    console.log('find');
    callback(true);
  }

};

module.exports = DatabaseManager;
