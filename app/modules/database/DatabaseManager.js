import Datastore from 'nedb';
import Crypto from 'crypto-js';
import {
  DB_FILE_PREFIX,
  DB_FILE_EXTENSION,
  AKEY,
  DB_COMMON_DATASTORE_OPTIONS,
  DB_AUTOCOMPACT_INTERVAL_MILISECONDS
} from '../../utils/Constants';
import _ from 'underscore';
import DatabaseCollection from './DatabaseCollection';

/**
 * Is a Singleton to centralize control over the database access.
 * TODO: this class should be part of an API to connect to different databases (like NeDB).
 * @type {{connect: ((name, callback, options)), disconnect: ((name, callback, options)), createCollection: ((name, callback, options)), destroyCollection: ((name, callback, options)), insert: ((object, callback, options)), remove: ((object, callback, options)), find: ((object, callback, options))}}
 */
class DatabaseManager {

  // This variable will keep a list of open datastores to avoid opening twice.
  collections = new Array();

  //VERY IMPORTANT: NeDB can execute 1 operation at the same time and the rest is queued, so we always work async.
  //VERY IMPORTANT 2: Loading the same datastore more than once didnt throw an error but drastically increased the MEM use.
  //VERY IMPORTANT 3: Using a filename like '/path/to/database' will create a directory in your disk root.
  //VERY IMPORTANT 4: A 60MB datastore file can use an average of 350MB with spikes of 800MB when opening (tested with 1M small documents).
  //VERY IMPORTANT 5: We might need to have a queue of pending operations on each collection to avoid conflicts.

  constructor() {
    console.log('constructor');
    if (!DatabaseManager.instance) {
      console.log('Reuse instance');
      DatabaseManager.instance = this;
    }
    return DatabaseManager.instance;
  };

  getCollection(name, options) {
    console.log('getCollection');
    let self = this;
    return new Promise(function (resolve, reject) {
      let newOptions = Object.assign({}, DB_COMMON_DATASTORE_OPTIONS, {filename: DB_FILE_PREFIX + name + DB_FILE_EXTENSION});
      if (options instanceof Object) {
        if (options.useEncryption === true) {
          newOptions.afterSerialization = self.encryptData;
          newOptions.beforeDeserialization = self.decryptData;
        }
      }
      self.openOrGetDatastore(name, newOptions).then(resolve).catch(reject);
    });
  }

  openOrGetDatastore(name, options) {
    let self = this;
    return new Promise(function (resolve, reject) {
      let auxDBCollection = self.checkIfCollectionIsOpen(name);
      if (auxDBCollection !== undefined) {
        resolve(auxDBCollection.nedbDatastore);
      } else {
        const db = new Datastore(options);
        db.persistence.setAutocompactionInterval(DB_AUTOCOMPACT_INTERVAL_MILISECONDS);
        self.collections.push(new DatabaseCollection(name, db));
        db.loadDatabase(function (err) {
          if (err !== null) {
            self.collections = _.without(self.collections, _.findWhere(self.collections, {name: name}));
            reject(err);
          } else {
            resolve(db);
          }
        });
      }
    });
  }

  saveOrUpdate(data, collection) {
    console.log('saveOrUpdate');
    return new Promise(function (resolve, reject) {
      // Look for an object by its id.
      let exampleObject = {id: data.id};
      collection.find(exampleObject, function (err, docs) {
        if (err !== null) {
          reject(err.toString());
        }
        if (docs.length === 1) {
          // Update.
          console.log('Update');
          collection.update(exampleObject, data, {}, function (err) {
            if (err === null) {
              resolve(data);
            } else {
              reject(err);
            }
          });
        } else if (docs.length === 0) {
          // Insert.
          console.log('Insert');
          collection.insert(data, function (err, newDoc) {
            if (err !== null) {
              reject(err);
            } else {
              resolve(newDoc);
            }
          });
        } else {
          reject("Something is really wrong with this record: " + exampleObject.id);
        }
      });
    });
  }

  insert(object, callback, options) {
    console.log('insert');
    callback(true);
  };

  remove(object, callback, options) {
    console.log('remove');
    callback(true);
  };

  find(object, callback, options) {
    console.log('find');
    callback(true);
  };

  checkIfCollectionIsOpen(name) {
    return _.find(self.collections, function (item) {
      return item.name === name;
    });
  }

  encryptData(dataString) {
    console.log('encryptData');
    return Crypto.AES.encrypt(dataString, AKEY);
  }

  decryptData(dataString) {
    console.log('decryptData');
    let bytes = Crypto.AES.decrypt(dataString, AKEY);
    return bytes.toString(Crypto.enc.Utf8);
  }
}

const instance = new DatabaseManager();
Object.freeze(instance);

export default instance;
