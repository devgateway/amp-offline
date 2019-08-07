import Datastore from 'nedb';
import Promise from 'bluebird';
import Crypto from 'crypto-js';
import os from 'os';
import { Constants } from 'amp-ui';
import AmpClientSecurity from 'amp-client-security';
import DatabaseCollection from './DatabaseCollection';
import Notification from '../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';
import Logger from '../../modules/util/LoggerManager';
import FileManager from '../util/FileManager';
import * as Utils from '../../utils/Utils';
import translate from '../../utils/translate';

let secureKey;

const logger = new Logger('Database manager');

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
  _initSecureKey() {
    logger.debug('_initSecureKey');
    const { username } = os.userInfo();
    return AmpClientSecurity.getSecurityKey(`${username}@amp-client`).then(key => {
      secureKey = key;
    });
  },

  // VERY IMPORTANT: NeDB can execute 1 operation at the same time and the rest is queued, so we always work async.
  // VERY IMPORTANT 2: Loading the same datastore more than once didnt throw an error but drastically increased the MEM
  // use.
  // VERY IMPORTANT 3: Using a filename like '/path/to/database' will create a directory in your disk root.
  // VERY IMPORTANT 4: A 60MB datastore file can use an average of 350MB with spikes of 800MB when opening (tested with
  // 1M small documents).
  // VERY IMPORTANT 5: We might need to have a queue of pending operations on each collection to avoid conflicts.

  _getCollection(name) {
    logger.debug('_getCollection');
    const useEncryption = Utils.isReleaseBranch();
    const keyInitPromise = (useEncryption && !secureKey) ? this._initSecureKey() : Promise.resolve();
    return keyInitPromise.then(() => new Promise((resolve, reject) => {
      const newOptions = Object.assign({}, Constants.DB_COMMON_DATASTORE_OPTIONS, {
        filename: FileManager.getFullPath(Constants.DB_FILE_PREFIX, `${name}${Constants.DB_FILE_EXTENSION}`)
      });
      // Encrypt the DB only when built from a release branch
      if (useEncryption) {
        newOptions.afterSerialization = this.encryptData;
        newOptions.beforeDeserialization = this.decryptData;
      }
      DatabaseManager._openOrGetDatastore(name, newOptions).then(resolve).catch(reject);
    }));
  },

  getCollection(name, options) {
    logger.debug('getCollection');
    const getCollectionFunc = this._getCollection.bind(null, name).bind(null, options);
    this.queuePromise(getCollectionFunc);
  },

  _openOrGetDatastore(name, options) {
    logger.debug('_openOrGetDatastore');
    const auxDBCollection = DatabaseCollection.getInstance().checkIfCollectionIsOpen(name);
    return new Promise((resolve, reject) => {
      if (auxDBCollection !== undefined) {
        resolve(auxDBCollection.nedbDatastore);
      } else {
        const db = new Datastore(options);
        db.persistence.setAutocompactionInterval(Constants.DB_AUTOCOMPACT_INTERVAL_MILISECONDS);
        DatabaseCollection.getInstance().insertCollection(name, db);
        db.loadDatabase((err) => {
          if (err !== null) {
            DatabaseCollection.getInstance().removeCollection(name);
            reject(DatabaseManager._createNotification(err));
          } else {
            DatabaseManager.createIndex(db, {}, (err2) => {
              if (err2 === null) {
                resolve(db);
              } else {
                reject(DatabaseManager._createNotification(err2));
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
    logger.log('_saveOrUpdate');
    DatabaseManager._getCollection(collectionName, options).then((collection) => {
      // Look for an object by its id.
      const exampleObject = { id };
      collection.find(exampleObject, (err, docs) => {
        if (err !== null) {
          reject(DatabaseManager._createNotification(err));
        }
        if (docs.length === 1) {
          logger.log('Update');
          collection.update(exampleObject, data, {}, (err2) => {
            if (err2 === null) {
              resolve(data);
            } else {
              reject(DatabaseManager._createNotification(err2));
            }
          });
        } else if (docs.length === 0) {
          logger.log('Insert');
          collection.insert(data, (err3, newDoc) => {
            if (err3 !== null) {
              reject(DatabaseManager._createNotification(err3));
            } else {
              resolve(newDoc);
            }
          });
        } else {
          reject(DatabaseManager._createNotification(
            `${translate('WrongRecord')}: ${exampleObject.id} - ${collectionName}`));
        }
      });
    }).catch(reject);
  },

  /**
   * Wrapper for calling _saveOrUpdate when we need that operation to be sync with other database related functions.
   */
  saveOrUpdate(id, data, collectionName, options) {
    logger.log('saveOrUpdate');
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
    logger.log('saveOrUpdateCollection');
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
    logger.log('_saveOrUpdateCollection');
    DatabaseManager._saveOrUpdateColl(collectionData, collectionName).then(newData => resolve(newData))
      .catch((saveUpdateError) =>
        // reject as a notification
        reject(DatabaseManager._createNotification(saveUpdateError.toString()))
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
            logger.log(`Inserting ${itemsToInsert.length} elements`);
            // we cannot chain through return from within a callback
            /* eslint-disable promise/catch-or-return */
            this._bulkInsert(collection, itemsToInsert).then(newDocs => {
              logger.log(`Updating ${itemsToUpdate.length} elements`);
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

  /**
   * Updates a collection based on the fields modifier rule
   * @param filter the filter to apply so that only matched documents are updated
   * @param fieldsModifier the fields modifier rule
   * @param collectionName
   */
  updateCollectionFields(filter = {}, fieldsModifier, collectionName) {
    logger.log('updateCollectionFields');
    return new Promise((resolve, reject) => {
      const updateCollectionFieldsFunc = DatabaseManager._updateCollectionFields
        .bind(null, collectionName, filter, fieldsModifier, resolve, reject);
      DatabaseManager.queuePromise(updateCollectionFieldsFunc);
    });
  },

  _updateCollectionFields(collectionName, filter, fieldsModifier, resolve, reject) {
    logger.log('_updateCollectionFields');
    DatabaseManager._getCollection(collectionName, {}).then((collection) => {
      collection.update(filter, fieldsModifier, { multi: true }, (err, numAffected) => {
        if (err === null) {
          resolve(numAffected);
        } else {
          reject(DatabaseManager._createNotification(err));
        }
      });
    }).catch(reject);
  },

  _replaceAll(collectionData, collectionName, filter = {}, resolve, reject) {
    logger.log('_replaceAll');
    DatabaseManager._getCollection(collectionName, {}).then((collection) => {
      collection.remove(filter, { multi: true }, (err) => {
        if (err === null) {
          collection.insert(collectionData, (err2, newDocs) => {
            if (err2 === null && newDocs.length === collectionData.length) {
              resolve(newDocs);
            } else {
              reject(DatabaseManager._createNotification(err2));
            }
          });
        } else {
          reject(DatabaseManager._createNotification(err));
        }
      });
    }).catch(reject);
  },

  _insertAll(collectionData, collectionName, options, resolve, reject) {
    logger.log('_insertAll');
    DatabaseManager._getCollection(collectionName, options).then((collection) => {
      collection.insert(collectionData, (err, newDocs) => {
        if (err === null && newDocs.length === collectionData.length) {
          resolve(newDocs);
        } else {
          reject(DatabaseManager._createNotification(err));
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
    logger.log('_removeById');
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      // Look for an object by its id.
      const exampleObject = Object.assign({ id }, example);
      collection.findOne(exampleObject, (err, doc) => {
        if (err !== null) {
          reject(DatabaseManager._createNotification(err));
        }
        if (doc !== null) {
          collection.remove(exampleObject, { multi: false }, (err2, count) => {
            if (err2 === null) {
              resolve(count);
            } else {
              reject(DatabaseManager._createNotification(err2));
            }
          });
        } else if (doc === null) {
          resolve(null);
        }
      });
    }).catch(reject);
  },

  removeById(id, collectionName, example) {
    logger.log('removeById');
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
    logger.log('removeAll');
    return new Promise((resolve, reject) => {
      const removeAllFunc = this._removeAll.bind(null, filter)
        .bind(null, collectionName)
        .bind(null, resolve)
        .bind(null, reject);
      this.queuePromise(removeAllFunc, resolve, reject);
    });
  },

  _removeAll(filter, collectionName, resolve, reject) {
    logger.log('_removeAll');
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.remove(filter, { multi: true }, (err, count) => {
        if (err === null) {
          resolve(count);
        } else {
          reject(DatabaseManager._createNotification(err));
        }
      });
    }).catch(reject);
  },

  findOne(example, collectionName) {
    logger.debug('findOne');
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
            reject(DatabaseManager._createNotification(translate('moreThanOneResultFound')));
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
    logger.debug('findTheFirstOne');
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
            return Promise.reject(DatabaseManager._createNotification(translate('moreThanOneResultFound')));
        }
      });
  },

  findAll(example = {}, collectionName, projections) {
    logger.debug('findAll');
    return this.findAllWithProjections(example, collectionName, projections);
  },

  findAllWithProjections(example, collectionName, projections) {
    logger.debug('findAllWithProjections');
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
    logger.debug('findAllWithProjections');
    const newProjections = Object.assign({ _id: 0 }, projections);
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.find(example, newProjections, (err, docs) => {
        if (err !== null) {
          reject(DatabaseManager._createNotification(err));
        }
        resolve(docs);
      });
    }).catch(reject);
  },

  findAllWithProjectionsAndOtherCriteria(example, collectionName, projections
    , sort = { id: 1 }, skip = 0, limit = Constants.DB_DEFAULT_QUERY_LIMIT) {
    logger.debug('findAllWithProjectionsAndOtherCriteria');
    return new Promise((resolve, reject) => {
      const findAllWithOtherCriteriaFunc = this._findAllWithProjectionsAndOtherCriteria.bind(
        null, example, collectionName, projections, sort, skip, limit, resolve, reject);
      this.queuePromise(findAllWithOtherCriteriaFunc, resolve, reject);
    });
  },

  _findAllWithProjectionsAndOtherCriteria(example, collectionName, projections, sort, skip, limit, resolve, reject) {
    logger.debug('_findAllWithProjectionsAndOtherCriteria');
    const newProjections = Object.assign({ _id: 0 }, projections);
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.find(example, newProjections).sort(sort).skip(skip).limit(limit)
        .exec((err, docs) => {
          if (err !== null) {
            reject(DatabaseManager._createNotification(err));
          }
          resolve(docs);
        });
    }).catch(reject);
  },

  count(example, collectionName) {
    logger.debug('count');
    return new Promise((resolve, reject) => {
      const countFunc = this._count.bind(null, example)
        .bind(null, collectionName)
        .bind(null, resolve)
        .bind(null, reject);
      this.queuePromise(countFunc, resolve, reject);
    });
  },

  _count(example = {}, collectionName, resolve, reject) {
    logger.debug('_count');
    DatabaseManager._getCollection(collectionName, null).then((collection) => {
      collection.count(example, (err, count) => {
        if (err !== null) {
          reject(DatabaseManager._createNotification(err));
        }
        resolve(count);
      });
    }).catch(reject);
  },

  encryptData(dataString) {
    // logger.log('encryptData');
    return Crypto.AES.encrypt(dataString, secureKey);
  },

  decryptData(dataString) {
    // logger.log('decryptData');
    const bytes = Crypto.AES.decrypt(dataString, secureKey);
    return bytes.toString(Crypto.enc.Utf8);
  },

  createIndex(datastore, options, callback) {
    logger.debug('createIndex');
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
    logger.debug('queuePromise');
    DatabaseCollection.getInstance().addPromiseAndProcess(task);
  },

  _createNotification(err, origin = NOTIFICATION_ORIGIN_DATABASE) {
    return new Notification({ message: `${translate('Database Error')}: ${err.toString()}`, origin });
  }
};

module.exports = DatabaseManager;
