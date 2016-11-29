import Datastore from 'nedb';
import DatabaseCollection from './DatabaseCollection';
import _ from 'underscore';
import Crypto from 'crypto-js';
import {DB_FILE_PREFIX, DB_FILE_EXTENSION, AKEY, DB_COMMON_DATASTORE_OPTIONS} from '../../utils/Constants';

/**
 * Is a Singleton to centralize control over the database access.
 * TODO: this class should be part of an API to connect to different databases (like NeDB).
 * @type {{connect: ((name, callback, options)), disconnect: ((name, callback, options)), createCollection: ((name, callback, options)), destroyCollection: ((name, callback, options)), insert: ((object, callback, options)), remove: ((object, callback, options)), find: ((object, callback, options))}}
 */
class DatabaseManager {

  // This variable will keep a list of open datastores to avoid opening twice.
  collections = [];

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

  getCollection(name, options, callback) {
    console.log('createCollectionAndConnect');
    let newOptions = Object.assign({}, DB_COMMON_DATASTORE_OPTIONS, {filename: DB_FILE_PREFIX + name + DB_FILE_EXTENSION});
    if (options instanceof Object) {
      if (options.useEncryption === true) {
        newOptions.afterSerialization = this.encryptData;
        newOptions.beforeDeserialization = this.decryptData;
      }
    }

    //TODO: check if datastore is alredy opened/being opened.
    const db = new Datastore(newOptions);
    db.loadDatabase(function (err) {
      if (err !== null) {
        callback(false);
      } else {
        callback(true, db);
      }
    });
  };

  saveOrUpdate(collection, data, callback) {
    console.log('saveOrUpdate');
    //TODO: implement the find-and-insert-if-not-exists.
    collection.insert(data, function (err, newDoc) {
      callback(err, newDoc);
    });
  };

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

  checkIfCollectionIsOpened(name) {
    //TODO: look for this collection in 'collections' and return it.
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
