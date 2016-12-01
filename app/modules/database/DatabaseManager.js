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

  /**
   * Receives an ID and a collection name (ie: 5|'users') and will insert a new record or update it if it exists by looking for id property.
   * @param id is an integer representing the 'id' field of the object.
   * @param data is the object to save.
   * @param collectionName is the name of the collection/table where we save the object (dont confuse with the actual collection/datastore).
   * @params (optional) is for sending settings to the function.
   * @returns {Promise}
   */
  saveOrUpdate(id, data, collectionName, options) {
    console.log('saveOrUpdate');
    var self = this;
    return new Promise(function (resolve, reject) {
      self.getCollection(collectionName, options).then(function (collection) { //TODO: sacar el useencription de aca.
        // Look for an object by its id.
        let exampleObject = {id: id};
        collection.find(exampleObject, function (err, docs) {
          if (err !== null) {
            reject(err.toString());
          }
          if (docs.length === 1) {
            console.log('Update');
            collection.update(exampleObject, data, {}, function (err) {
              if (err === null) {
                resolve(data);
              } else {
                reject(err);
              }
            });
          } else if (docs.length === 0) {
            console.log('Insert');
            collection.insert(data, function (err, newDoc) {
              if (err !== null) {
                reject(err);
              } else {
                resolve(newDoc);
              }
            });
          } else {
            reject("Something is really wrong with this record: " + exampleObject.id + " " + collectionName);
          }
        });
      }).catch(reject);
    });
  }

  removeById(id, collectionName, options) {
    console.log('removeById');
    var self = this;
    return new Promise(function (resolve, reject) {
      self.getCollection(collectionName, null).then(function (collection) {
        // Look for an object by its id.
        let exampleObject = {id: id};
        collection.findOne(exampleObject, function (err, doc) {
          if (err !== null) {
            reject(err.toString());
          }
          if (doc !== null) {
            collection.remove(exampleObject, data, {}, function (err) {
              if (err === null) {
                resolve();
              } else {
                reject(err);
              }
            });
          } else if (docs.length === 0) {
            resolve();
          }
        });
      }).catch(reject);
    });
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
