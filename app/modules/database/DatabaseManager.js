import Datastore from 'nedb';
import Promise from 'bluebird';
import Crypto from 'crypto-js';
import {
  DB_FILE_PREFIX,
  DB_FILE_EXTENSION,
  AKEY,
  DB_COMMON_DATASTORE_OPTIONS,
  DB_AUTOCOMPACT_INTERVAL_MILISECONDS
} from '../../utils/Constants';
import DatabaseCollection from './DatabaseCollection';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';

/**
 * Is a Singleton to centralize control over the database access.
 * TODO: this class should be part of an API to connect to different databases (like NeDB).
 * @type {{connect: ((name, callback, options)), disconnect: ((name, callback, options)), createCollection: ((name,
 * callback, options)), destroyCollection: ((name, callback, options)), insert: ((object, callback, options)), remove:
 * ((object, callback, options)), find: ((object, callback, options))}}
 */
const DatabaseManager = {

  // VERY IMPORTANT: NeDB can execute 1 operation at the same time and the rest is queued, so we always work async.
  // VERY IMPORTANT 2: Loading the same datastore more than once didnt throw an error but drastically increased the MEM
  // use.
  // VERY IMPORTANT 3: Using a filename like '/path/to/database' will create a directory in your disk root.
  // VERY IMPORTANT 4: A 60MB datastore file can use an average of 350MB with spikes of 800MB when opening (tested with
  // 1M small documents).
  // VERY IMPORTANT 5: We might need to have a queue of pending operations on each collection to avoid conflicts.

  _getCollection(name) {
    console.log('_getCollection');
    const self = this;
    return new Promise((resolve, reject) => {
      const newOptions = Object.assign({}, DB_COMMON_DATASTORE_OPTIONS, {
        filename: DB_FILE_PREFIX + name
        + DB_FILE_EXTENSION
      });
      newOptions.afterSerialization = self.encryptData;
      newOptions.beforeDeserialization = self.decryptData;
      DatabaseManager._openOrGetDatastore(name, newOptions).then(resolve).catch(reject);
    });
  },

  getCollection(name, options) {
    console.log('getCollection');
    const getCollectionFunc = this._getCollection.bind(null, name).bind(null, options);
    this.queuePromise(getCollectionFunc);
  },

  _openOrGetDatastore(name, options) {
    console.log('_openOrGetDatastore');
    const auxDBCollection = DatabaseCollection.getInstance().checkIfCollectionIsOpen(name);
    return new Promise((resolve, reject) => {
      if (auxDBCollection !== undefined) {
        resolve(auxDBCollection.nedbDatastore);
      } else {
        const db = new Datastore(options);
        db.persistence.setAutocompactionInterval(DB_AUTOCOMPACT_INTERVAL_MILISECONDS);
        DatabaseCollection.getInstance().insertCollection(name, db);
        db.loadDatabase((err) => {
          if (err !== null) {
            DatabaseCollection.getInstance().removeCollection(name);
            reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
          } else {
            DatabaseManager.createIndex(db, {}, (err2) => {
              if (err2 === null) {
                resolve(db);
              } else {
                reject(new Notification({ message: err2.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
              }
            });
          }
        });
      }
    });
  },

  /**
   * Receives an ID and a collection name (ie: 5|'users') and will insert a new record or update it if it exists by
   * looking for id property.
   * Dont call this function from outside this class and/or when you need to be sync with other database operations.
   */
  _saveOrUpdate(id, data, collectionName, options, resolve, reject) {
    console.log('_saveOrUpdate');
    DatabaseManager._getCollection(collectionName, options).then((collection) => {
      // Look for an object by its id.
      const exampleObject = { id };
      collection.find(exampleObject, (err, docs) => {
        if (err !== null) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
        }
        if (docs.length === 1) {
          console.log('Update');
          collection.update(exampleObject, data, {}, (err2) => {
            if (err2 === null) {
              resolve(data);
            } else {
              reject(new Notification({ message: err2.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
            }
          });
        } else if (docs.length === 0) {
          console.log('Insert');
          collection.insert(data, (err3, newDoc) => {
            if (err3 !== null) {
              reject(new Notification({ message: err3.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
            } else {
              resolve(newDoc);
            }
          });
        } else {
          reject(new Notification({
            message: `Something is really wrong with this record: ${exampleObject.id} - ${collectionName}`,
            origin: NOTIFICATION_ORIGIN_DATABASE
          }));
        }
      });
    }).catch(reject);
  },

  /**
   * Wrapper for calling _saveOrUpdate when we need that operation to be sync with other database related functions.
   */
  saveOrUpdate(id, data, collectionName, options) {
    console.log('saveOrUpdate');
    // This promise will be resolved/rejected inside '_saveOrUpdate', but initiated by the queue manager in
    // DatabaseCollection.js.
    return new Promise((resolve, reject) => {
      // We define a variable with the function instead of calling it because a Promise will start inmediately.
      const saveOrUpdateFunc = DatabaseManager._saveOrUpdate
        .bind(null, id)
        .bind(null, data)
        .bind(null, collectionName)
        .bind(null, options)
        .bind(null, resolve)
        .bind(null, reject);
      DatabaseManager.queuePromise(saveOrUpdateFunc);
    });
  },

  _replaceAll(collectionData, collectionName, options, resolve, reject) {
    console.log('_replaceAll');
    DatabaseManager._getCollection(collectionName, options).then((collection) => {
      collection.remove({}, { multi: true }, (err) => {
        if (err === null) {
          collection.insert(collectionData, (err2, newDocs) => {
            if (err2 === null && newDocs.length === collectionData.length) {
              resolve(newDocs);
            } else {
              reject(new Notification({ message: err2.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
            }
          });
        } else {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
        }
      });
    }).catch(reject);
  },

  _insertAll(collectionData, collectionName, options, resolve, reject) {
    console.log('_insertAll');
    DatabaseManager._getCollection(collectionName, options).then((collection) => {
      collection.insert(collectionData, (err, newDocs) => {
        if (err === null && newDocs.length === collectionData.length) {
          resolve(newDocs);
        } else {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
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
    return new Promise((resolve, reject) => {
      const replaceAll = DatabaseManager._replaceAll
        .bind(null, collectionData)
        .bind(null, collectionName)
        .bind(null, options)
        .bind(null, resolve)
        .bind(null, reject);
      DatabaseManager.queuePromise(replaceAll);
    });
  },

  saveOrUpdateCollection() {
    // TODO:
  },

  _removeById(id, collectionName, options, resolve, reject) {
    console.log('_removeById');
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      // Look for an object by its id.
      const exampleObject = { id };
      collection.findOne(exampleObject, (err, doc) => {
        if (err !== null) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
        }
        if (doc !== null) {
          collection.remove(exampleObject, { multi: false }, (err2, count) => {
            if (err2 === null) {
              resolve(count);
            } else {
              reject(new Notification({ message: err2.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
            }
          });
        } else if (doc === null) {
          resolve(null);
        }
      });
    }).catch(reject);
  },

  removeById(id, collectionName, options) {
    console.log('removeById');
    const self = this;
    return new Promise((resolve, reject) => {
      const removeByIdFunc = self._removeById.bind(null, id)
        .bind(null, collectionName)
        .bind(null, options)
        .bind(null, resolve)
        .bind(null, reject);
      self.queuePromise(removeByIdFunc, resolve, reject);
    });
  },

  findOne(example, collectionName) {
    console.log('findOne');
    const projections = Object.assign({ _id: 0 });
    return new Promise((resolve, reject) => {
      DatabaseManager.findAll(example, collectionName, projections).then((docs) => {
        switch (docs.length) {
          case 0:
            resolve(null);
            break;
          case 1:
            resolve(docs[0]);
            break;
          default:
            reject(new Notification({
              message: 'database.moreThanOneResultFound',
              origin: NOTIFICATION_ORIGIN_DATABASE
            }));
            break;
        }
      }).catch(reject);
    });
  },

  findAll(example, collectionName, projections) {
    console.log('findAll');
    return this.findAllWithProjections(example, collectionName, projections);
  },

  findAllWithProjections(example, collectionName, projections) {
    console.log('findAllWithProjections');
    const newProjections = Object.assign({ _id: 0 }, projections);
    return new Promise((resolve, reject) => {
      DatabaseManager._getCollection(collectionName, null).then((collection) => {
        collection.find(example, newProjections, (err, docs) => {
          if (err !== null) {
            reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
          }
          if (docs !== null) {
            resolve(docs);
          }
        });
      }).catch(reject);
    });
  },

  encryptData(dataString) {
    // console.log('encryptData');
    return Crypto.AES.encrypt(dataString, AKEY);
  },

  decryptData(dataString) {
    // console.log('decryptData');
    const bytes = Crypto.AES.decrypt(dataString, AKEY);
    return bytes.toString(Crypto.enc.Utf8);
  },

  createIndex(datastore, options, callback) {
    console.log('createIndex');
    const newOptions = Object.assign({}, options, {
      fieldName: 'id',
      unique: true
    });
    datastore.ensureIndex(newOptions, callback);
  },

  /**
   * Queue a Promise function for execution when there are no other database related operations running and then
   * call resolve and reject (if provided).
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
