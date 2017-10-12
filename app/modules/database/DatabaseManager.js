import Datastore from 'nedb';
import Promise from 'bluebird';
import Crypto from 'crypto-js';
import {
  DB_AUTOCOMPACT_INTERVAL_MILISECONDS,
  DB_COMMON_DATASTORE_OPTIONS,
  DB_DEFAULT_QUERY_LIMIT,
  DB_FILE_EXTENSION,
  DB_FILE_PREFIX,
  AKEY
} from '../../utils/Constants';
import DatabaseCollection from './DatabaseCollection';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';
import LoggerManager from '../../modules/util/LoggerManager';
import FileManager from '../util/FileManager';

// NeDB API is based on callbacks and not promises. Disabling always-return to avoid encapsulating each into a promise
/* eslint-disable promise/always-return */

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
    LoggerManager.log('_getCollection');
    return new Promise((resolve, reject) => {
      const newOptions = Object.assign({}, DB_COMMON_DATASTORE_OPTIONS, {
        filename: FileManager.getFullPath(DB_FILE_PREFIX, `${name}${DB_FILE_EXTENSION}`)
      });
      if (process.env.NODE_ENV === 'production') {
        /* newOptions.afterSerialization = self.encryptData;
         newOptions.beforeDeserialization = self.decryptData;*/
      }
      DatabaseManager._openOrGetDatastore(name, newOptions).then(resolve).catch(reject);
    });
  },

  getCollection(name, options) {
    LoggerManager.log('getCollection');
    const getCollectionFunc = this._getCollection.bind(null, name).bind(null, options);
    this.queuePromise(getCollectionFunc);
  },

  _openOrGetDatastore(name, options) {
    LoggerManager.log('_openOrGetDatastore');
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
    LoggerManager.log('_saveOrUpdate');
    DatabaseManager._getCollection(collectionName, options).then((collection) => {
      // Look for an object by its id.
      const exampleObject = { id };
      collection.find(exampleObject, (err, docs) => {
        if (err !== null) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
        }
        if (docs.length === 1) {
          LoggerManager.log('Update');
          collection.update(exampleObject, data, {}, (err2) => {
            if (err2 === null) {
              resolve(data);
            } else {
              reject(new Notification({ message: err2.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
            }
          });
        } else if (docs.length === 0) {
          LoggerManager.log('Insert');
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
    LoggerManager.log('saveOrUpdate');
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

  /**
   * SaveOrUpdate elements by inserting in bulk, but still update one by one, as permitted by NeDB. However insert
   * and updates will bypass multiple DB promises queueing, therefore optimizing the bulk saveUpdate.
   * @param collectionData elements to update
   * @param collectionName name of the collection to update
   */
  saveOrUpdateCollection(collectionData, collectionName) {
    LoggerManager.log('saveOrUpdateCollection');
    return new Promise((resolve, reject) => {
      const saveOrUpdateCollectionFunc = DatabaseManager._saveOrUpdateCollection
        .bind(null, collectionData)
        .bind(null, collectionName)
        .bind(null, resolve)
        .bind(null, reject);
      DatabaseManager.queuePromise(saveOrUpdateCollectionFunc);
    });
  },

  /**
   * Insert all new items in one go and update existing items one by one
   */
  _saveOrUpdateCollection(collectionData, collectionName, resolve, reject) {
    LoggerManager.log('_saveOrUpdateCollection');
    DatabaseManager._saveOrUpdateColl(collectionData, collectionName).then(newData => resolve(newData))
      .catch((saveUpdateError) =>
        // reject as a notification
        reject(new Notification({ message: saveUpdateError.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }))
      );
  },

  /**
   * Saves or updates items from the collection
   */
  _saveOrUpdateColl(collectionData, collectionName) {
    return new Promise((resolve, reject) =>
      DatabaseManager._getCollection(collectionName).then((collection) => {
        const ids = collectionData.map(item => item.id);
        collection.find({ id: { $in: ids } }, { id: 1 }, (err, foundItems) => {
          if (err) {
            reject(err);
          } else {
            const itemsToInsert = [];
            const itemsToUpdate = [];
            this._splitItems(collectionData, itemsToInsert, itemsToUpdate, foundItems, reject);
            LoggerManager.log(`Inserting ${itemsToInsert.length} elements`);
            // we cannot chain through return from within a callback
            /* eslint-disable promise/catch-or-return */
            this._bulkInsert(collection, itemsToInsert).then(newDocs => {
              LoggerManager.log(`Updating ${itemsToUpdate.length} elements`);
              return Promise.all(itemsToUpdate.map(item => this._collectionItemUpdate(collection, item)))
                .then(updatedDocs => {
                  const allDocs = newDocs.concat(updatedDocs);
                  resolve(allDocs);
                }).catch(reject);
            }).catch(reject);
            /* eslint-enable promise/catch-or-return */
          }
        });
      }).catch(reject)
    );
  },

  _splitItems(collectionData, itemsToInsert, itemsToUpdate, foundItems, reject) {
    const foundIds = foundItems.map(item => item.id);
    const uniqueInsertIds = new Set();
    collectionData.forEach(item => {
      if (foundIds.includes(item.id)) {
        itemsToUpdate.push(item);
      } else {
        if (uniqueInsertIds.has(item.id)) {
          reject('Invalid data with duplicate ids');
        }
        uniqueInsertIds.add(item.id);
        itemsToInsert.push(item);
      }
    });
  },

  _bulkInsert(collection, itemsToInsert) {
    return new Promise((resolve, reject) => {
      collection.insert(itemsToInsert, (insertErr, newData) => {
        if (insertErr) {
          reject(insertErr);
        } else {
          resolve(newData);
        }
      });
    });
  },

  /**
   * This is reserved for bulk collection update, expecting the item to definitely exist.
   * Do not use in a different context.
   */
  _collectionItemUpdate(collection, item) {
    return new Promise((resolve, reject) => {
      const filter = { id: item.id };
      // double check that this is the only item before executing the update
      collection.find(filter, (err, docs) => {
        if (err) {
          reject(err);
        } else if (docs.length !== 1) {
          reject(`Data corruption. Matching ${docs.length} documents, instead of 1.`);
        } else {
          collection.update(filter, item, { returnUpdatedDocs: true }, (updateErr, numAffected, newDoc) => {
            if (updateErr) {
              reject(updateErr);
            } else {
              resolve(newDoc);
            }
          });
        }
      });
    });
  },

  _replaceAll(collectionData, collectionName, filter = {}, resolve, reject) {
    LoggerManager.log('_replaceAll');
    DatabaseManager._getCollection(collectionName, {}).then((collection) => {
      collection.remove(filter, { multi: true }, (err) => {
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
    LoggerManager.log('_insertAll');
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
   * @param filter
   */
  replaceCollection(collectionData, collectionName, filter) {
    return new Promise((resolve, reject) => {
      const replaceAll = DatabaseManager._replaceAll
        .bind(null, collectionData)
        .bind(null, collectionName)
        .bind(null, filter)
        .bind(null, resolve)
        .bind(null, reject);
      DatabaseManager.queuePromise(replaceAll);
    });
  },

  _removeById(id, collectionName, example, resolve, reject) {
    LoggerManager.log('_removeById');
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      // Look for an object by its id.
      const exampleObject = Object.assign({ id }, example);
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

  removeById(id, collectionName, example) {
    LoggerManager.log('removeById');
    const self = this;
    return new Promise((resolve, reject) => {
      const removeByIdFunc = self._removeById.bind(null, id)
        .bind(null, collectionName)
        .bind(null, example)
        .bind(null, resolve)
        .bind(null, reject);
      self.queuePromise(removeByIdFunc, resolve, reject);
    });
  },

  /**
   * Removes all entries that match filter criteria
   * @param filter
   * @param collectionName
   */
  removeAll(filter, collectionName) {
    LoggerManager.log('removeAll');
    return new Promise((resolve, reject) => {
      const removeAllFunc = this._removeAll.bind(null, filter)
        .bind(null, collectionName)
        .bind(null, resolve)
        .bind(null, reject);
      this.queuePromise(removeAllFunc, resolve, reject);
    });
  },

  _removeAll(filter, collectionName, resolve, reject) {
    LoggerManager.log('_removeAll');
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.remove(filter, { multi: true }, (err, count) => {
        if (err === null) {
          resolve(count);
        } else {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
        }
      });
    }).catch(reject);
  },

  findOne(example, collectionName) {
    LoggerManager.log('findOne');
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
              message: 'moreThanOneResultFound',
              origin: NOTIFICATION_ORIGIN_DATABASE
            }));
            break;
        }
      }).catch(reject);
    });
  },

  /**
   * Finds the first element from the filtered results that are sorted by sortCriteria
   * @param example the documents filter
   * @param sortCriteria sorting to apply over the filtered results
   * @param collectionName
   * @return {Promise}
   */
  findTheFirstOne(example, sortCriteria, collectionName) {
    LoggerManager.log('findTheFirstOne');
    const projections = Object.assign({ _id: 0 });
    return DatabaseManager.findAllWithProjectionsAndOtherCriteria(
      example, collectionName, projections, sortCriteria, 0, 1)
        .then((docs) => {
          switch (docs.length) {
            case 0:
              return null;
            case 1:
              return docs[0];
            default:
              return Promise.reject(new Notification({
                message: 'moreThanOneResultFound',
                origin: NOTIFICATION_ORIGIN_DATABASE
              }));
          }
        });
  },

  findAll(example = {}, collectionName, projections) {
    LoggerManager.log('findAll');
    return this.findAllWithProjections(example, collectionName, projections);
  },

  findAllWithProjections(example, collectionName, projections) {
    LoggerManager.log('findAllWithProjections');
    return new Promise((resolve, reject) => {
      const findAllWithProjectionsFunc = this._findAllWithProjections.bind(null, example)
        .bind(null, collectionName)
        .bind(null, projections)
        .bind(null, resolve)
        .bind(null, reject);
      this.queuePromise(findAllWithProjectionsFunc, resolve, reject);
    });
  },

  _findAllWithProjections(example, collectionName, projections, resolve, reject) {
    LoggerManager.log('findAllWithProjections');
    const newProjections = Object.assign({ _id: 0 }, projections);
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.find(example, newProjections, (err, docs) => {
        if (err !== null) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
        }
        resolve(docs);
      });
    }).catch(reject);
  },

  findAllWithProjectionsAndOtherCriteria(example, collectionName, projections, sort = { id: 1 }, skip = 0,
    limit = DB_DEFAULT_QUERY_LIMIT) {
    LoggerManager.log('findAllWithProjectionsAndOtherCriteria');
    return new Promise((resolve, reject) => {
      const findAllWithOtherCriteriaFunc = this._findAllWithProjectionsAndOtherCriteria.bind(
        null, example, collectionName, projections, sort, skip, limit, resolve, reject);
      this.queuePromise(findAllWithOtherCriteriaFunc, resolve, reject);
    });
  },

  _findAllWithProjectionsAndOtherCriteria(example, collectionName, projections, sort, skip, limit, resolve, reject) {
    LoggerManager.log('_findAllWithProjectionsAndOtherCriteria');
    const newProjections = Object.assign({ _id: 0 }, projections);
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.find(example, newProjections).sort(sort).skip(skip).limit(limit)
        .exec((err, docs) => {
          if (err !== null) {
            reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
          }
          resolve(docs);
        });
    }).catch(reject);
  },

  count(example, collectionName) {
    LoggerManager.log('count');
    return new Promise((resolve, reject) => {
      const countFunc = this._count.bind(null, example)
        .bind(null, collectionName)
        .bind(null, resolve)
        .bind(null, reject);
      this.queuePromise(countFunc, resolve, reject);
    });
  },

  _count(example, collectionName, resolve, reject) {
    LoggerManager.log('_count');
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.count(example, (err, count) => {
        if (err !== null) {
          reject(new Notification({ message: err.toString(), origin: NOTIFICATION_ORIGIN_DATABASE }));
        }
        resolve(count);
      });
    }).catch(reject);
  },

  encryptData(dataString) {
    // LoggerManager.log('encryptData');
    return Crypto.AES.encrypt(dataString, AKEY);
  },

  decryptData(dataString) {
    // LoggerManager.log('decryptData');
    const bytes = Crypto.AES.decrypt(dataString, AKEY);
    return bytes.toString(Crypto.enc.Utf8);
  },

  createIndex(datastore, options, callback) {
    LoggerManager.log('createIndex');
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
    LoggerManager.log('queuePromise');
    DatabaseCollection.getInstance().addPromiseAndProcess(task);
  }
};

module.exports = DatabaseManager;
