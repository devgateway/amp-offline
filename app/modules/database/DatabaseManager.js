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
      newOptions.afterSerialization = self.encryptData;
      newOptions.beforeDeserialization = self.decryptData;
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
            reject(err.toString());
          } else {
            DatabaseManager.createIndex(db, {}, function (err) {
              if (err === null) {
                resolve(db);
              } else {
                reject(err.toString());
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
    // This promise will be resolved/rejected inside '_saveOrUpdate', but initiated by the queue manager in DatabaseCollection.js.
    let promise = new Promise(function (resolve, reject) {
      // We define a variable with the function instead of calling it because a Promise will start inmediately.
      let saveOrUpdateFunc = DatabaseManager._saveOrUpdate.bind(null, id).bind(null, data).bind(null, collectionName).bind(null, options).bind(null, resolve).bind(null, reject);
      DatabaseManager.queuePromise(saveOrUpdateFunc);
    });
    return promise;
  },

  _replaceAll(collectionData, collectionName, options, resolve, reject) {
    console.log('_replaceAll');
    DatabaseManager._getCollection(collectionName, options).then(function (collection) {
      collection.remove({}, { multi: true }, function (err) {
        if (err === null) {
          collection.insert(collectionData, function (err, newDocs) {
            if (err === null && newDocs.length === collectionData.length) {
              resolve(newDocs);
            } else {
              reject(err);
            }
          });
        } else {
          reject(err);
        }
      });
    }).catch(reject);
  },

  _insertAll(collectionData, collectionName, options, resolve, reject) {
    console.log('_insertAll');
    DatabaseManager._getCollection(collectionName, options).then(function (collection) {
      collection.insert(collectionData, function (err, newDocs) {
        if (err === null && newDoc.length === collectionData.length) {
          resolve(newDocs);
        } else {
          reject(err);
        }
      });
    }).catch(reject);
  },

  /**
   * Replace entire collection with the new set of data
   * @param collectionData
   * @param collectionName
   * @param options
   */
  replaceCollection(collectionData, collectionName, options) {
    let promise = new Promise(function (resolve, reject) {
      let replaceAll = DatabaseManager._replaceAll.bind(null, collectionData).bind(null, collectionName).bind(null, options).bind(null, resolve).bind(null, reject);
      DatabaseManager.queuePromise(replaceAll);
    });
    return promise;
  },

  /**
   *
   * @param collectionData
   * @param collectionName
   * @param options
   */
  saveOrUpdateCollection(collectionData, collectionName, options) {
    //TODO:
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
          collection.remove(exampleObject, {multi: false}, function (err, count) {
            if (err === null) {
              resolve(count);
            } else {
              reject(err);
            }
          });
        } else if (doc === null) {
          resolve();
        }
      });
    }).catch(reject);
  },

  removeById(id, collectionName, options) {
    console.log('removeById');
    let self = this;
    let promise = new Promise(function (resolve, reject) {
      let removeByIdFunc = self._removeById.bind(null, id).bind(null, collectionName).bind(null, options).bind(null, resolve).bind(null, reject);
      self.queuePromise(removeByIdFunc, resolve, reject);
    });
    return promise;
  },

  findOne(example, collectionName) {
    console.log('_findOne');
    let projections = Object.assign({_id: 0});
    return new Promise(function (resolve, reject) {
      DatabaseManager._getCollection(collectionName, null).then(function (collection) {
        collection.findOne(example, projections, function (err, doc) {
          if (err !== null) {
            reject(err.toString());
          }
          if (doc !== null) {
            resolve(doc);
          }
        });
      }).catch(reject);
    });
  },

  findAll(example, collectionName) {
    return this.findAllWithProjections(example, null, collectionName);
  },

  findAllWithProjections(example, projections, collectionName) {
    console.log('findAll');
    projections = Object.assign({_id: 0}, projections);
    return new Promise(function (resolve, reject) {
      DatabaseManager._getCollection(collectionName, null).then(function (collection) {
        collection.find(example, projections, function (err, docs) {
          if (err !== null) {
            reject(err.toString());
          }
          if (docs !== null) {
            resolve(docs);
          }
        });
      }).catch(reject);
    });
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
  queuePromise(task) {
    console.log('queuePromise');
    DatabaseCollection.getInstance().addPromiseAndProcess(task);
  }
};

module.exports = DatabaseManager;
