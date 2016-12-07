import Datastore from 'nedb';
import Crypto from 'crypto-js';
import {
  DB_FILE_PREFIX,
  DB_FILE_EXTENSION,
  AKEY,
  DB_COMMON_DATASTORE_OPTIONS,
  DB_AUTOCOMPACT_INTERVAL_MILISECONDS
} from '../../utils/Constants';
import DatabaseCollection from './DatabaseCollection';
import Promise from 'bluebird';

/**
 * Is a Singleton to centralize control over the database access.
 * TODO: this class should be part of an API to connect to different databases (like NeDB).
 * @type {{connect: ((name, callback, options)), disconnect: ((name, callback, options)), createCollection: ((name, callback, options)), destroyCollection: ((name, callback, options)), insert: ((object, callback, options)), remove: ((object, callback, options)), find: ((object, callback, options))}}
 */
const DatabaseManager = {

  //VERY IMPORTANT: NeDB can execute 1 operation at the same time and the rest is queued, so we always work async.
  //VERY IMPORTANT 2: Loading the same datastore more than once didnt throw an error but drastically increased the MEM use.
  //VERY IMPORTANT 3: Using a filename like '/path/to/database' will create a directory in your disk root.
  //VERY IMPORTANT 4: A 60MB datastore file can use an average of 350MB with spikes of 800MB when opening (tested with 1M small documents).
  //VERY IMPORTANT 5: We might need to have a queue of pending operations on each collection to avoid conflicts.

  _getCollection(name, options) {
    console.log('_getCollection');
    let self = this;
    return new Promise(function (resolve, reject) {
      let newOptions = Object.assign({}, DB_COMMON_DATASTORE_OPTIONS, {filename: DB_FILE_PREFIX + name + DB_FILE_EXTENSION});
      if (options instanceof Object) {
        if (options.useEncryption === true) {
          newOptions.afterSerialization = self.encryptData;
          newOptions.beforeDeserialization = self.decryptData;
        }
      }
      DatabaseManager._openOrGetDatastore(name, newOptions).then(resolve).catch(reject);
    });
  },

  getCollection(name, options) {
    console.log('getCollection');
    let getCollectionFunc = this._getCollection.bind(null, name).bind(null, options);
    this.queuePromise(getCollectionFunc);
  },

  _openOrGetDatastore(name, options) {
    console.log('_openOrGetDatastore');
    let auxDBCollection = DatabaseCollection.getInstance().checkIfCollectionIsOpen(name);
    return new Promise(function (resolve, reject) {
      if (auxDBCollection !== undefined) {
        resolve(auxDBCollection.nedbDatastore);
      } else {
        const db = new Datastore(options);
        db.persistence.setAutocompactionInterval(DB_AUTOCOMPACT_INTERVAL_MILISECONDS);
        DatabaseCollection.getInstance().insertCollection(name, db);
        db.loadDatabase(function (err) {
          if (err !== null) {
            DatabaseCollection.getInstance().removeCollection(name);
            reject(JSON.stringify(err));
          } else {
            DatabaseManager.createIndex(db, {}, function (err) {
              if (err === null) {
                resolve(db);
              } else {
                reject(JSON.stringify(err));
              }
            });
          }
        });
      }
    });
  },

  /**
   * Receives an ID and a collection name (ie: 5|'users') and will insert a new record or update it if it exists by looking for id property.
   * Dont call this function from outside this class and/or when you need to be sync with other database operations.
   */
  _saveOrUpdate(id, data, collectionName, options, resolve, reject) {
    console.log('_saveOrUpdate');
    DatabaseManager._getCollection(collectionName, options).then(function (collection) {
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
  },

  /**
   * Wrapper for calling _saveOrUpdate when we need that operation to be sync with other database related functions.
   */
  saveOrUpdate(id, data, collectionName, options) {
    console.log('saveOrUpdate');
    let promise = new Promise(function (resolve, reject) {
      let saveOrUpdateFunc = DatabaseManager._saveOrUpdate.bind(null, id).bind(null, data).bind(null, collectionName).bind(null, options).bind(null, resolve).bind(null, reject);
      DatabaseManager.queuePromise(saveOrUpdateFunc, resolve, reject);
    });
    return promise;
  },

  _removeById(id, collectionName, options, resolve, reject) {
    console.log('_removeById');
    var self = this;
    DatabaseManager._getCollection(collectionName, null).then(function (collection) {
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
  },

  removeById(id, collectionName, options) {
    console.log('removeById');
    let promise = new Promise(function (resolve, reject) {
      let removeByIdFunc = this._removeById.bind(null, id).bind(null, collectionName).bind(null, options).bind(null, resolve).bind(null, reject);
      this.queuePromise(removeByIdFunc, resolve, reject);
    });
    return promise;
  },

  encryptData(dataString) {
    //console.log('encryptData');
    return Crypto.AES.encrypt(dataString, AKEY);
  },

  decryptData(dataString) {
    //console.log('decryptData');
    let bytes = Crypto.AES.decrypt(dataString, AKEY);
    return bytes.toString(Crypto.enc.Utf8);
  },

  createIndex(datastore, options, callback) {
    console.log('createIndex');
    let newOptions = Object.assign({}, options, {
      fieldName: 'id',
      unique: true
    });
    datastore.ensureIndex(newOptions, callback);
  },

  /**
   * Queue a Promise function for execution when there are no other database related operations running and then call resolve and reject (if provided).
   * @param task
   * @param resolve When present is the resolve part of a another Promise we want to resolve.
   * @param reject Idem for catching an error.
   */
  queuePromise(task, resolve, reject) {
    console.log('queuePromise');
    DatabaseCollection.getInstance().addPromiseAndProcess(task, resolve, reject);
  }
};

module.exports = DatabaseManager;
