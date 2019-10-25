/* eslint-disable class-methods-use-this */
import { Constants } from 'amp-ui';
import * as DatabaseManager from '../DatabaseManager';
import Logger from '../../util/LoggerManager';
import FileManager from '../../util/FileManager';
import * as Utils from '../../../utils/Utils';
import DatabaseSanityStatus from './DatabaseSanityStatus';
import * as SCC from '../../../utils/constants/SanityCheckConstants';
import DatabaseCleanup from './DatabaseCleanup';
import { LEGACY_KEY } from '../../../utils/constants/UserConstants';

const logger = new Logger('DatabaseTransition');

/**
 * @author Nadejda Mandrescu
 */
export default class DatabaseTransition {
  constructor(status: DatabaseSanityStatus) {
    this._status = status;
    Utils.selfBindMethods(this);
  }

  run() {
    logger.warn('run');
    if (!Utils.isReleaseBranch()) {
      logger.warn('Halting DB transition - not a release branch');
      this._status.healReason = SCC.REASON_NOT_RELEASED;
      return Promise.resolve(this._status);
    }
    this._actualKey = DatabaseManager.getSecureKey();
    this._legacyKey = DatabaseManager.getLegacyKey();
    this._remaining = new Set(this._status.details.remainingCorruptedDBNames);
    try {
      return this._doTheTransition().then(this._finalize).catch(this._finalize);
    } catch (e) {
      return this._finalize(e);
    }
  }

  _doTheTransition() {
    logger.log('_doTheTransition');
    return this._status.details.remainingCorruptedDBNames.reduce((prevPromise, dbName) =>
      prevPromise.then(() => this._transitDB(dbName))
    , Promise.resolve());
  }

  /**
   * @param dbName
   * @returns {Promise<string>} resolves to an error if present or null
   * @private
   */
  _transitDB(dbName:string) {
    logger.log(`_transitDB: ${dbName}`);
    const tmpDBName = `${dbName}${Constants.TMP_FILE_EXTENSION}`;
    const tmpPath = DatabaseManager.getDBFullPath(tmpDBName);
    FileManager.deleteFileSync(tmpPath);
    DatabaseManager.setKey(this._legacyKey);
    return DatabaseManager.findAll({}, dbName)
      .then(data => this._transitData(dbName, tmpDBName, data))
      .then(() => this._replaceDB(dbName, tmpPath))
      .catch(this._processError);
  }

  _transitData(dbName: string, tmpDBName: string, data: Array) {
    logger.log('_transitData');
    DatabaseManager.setKey(this._actualKey);
    if (dbName === Constants.COLLECTION_USERS) {
      data.forEach(u => {
        if (u.ampOfflinePassword && u.ampOfflinePassword.toString().trim() !== '') {
          u[LEGACY_KEY] = this._legacyKey;
        }
      });
    }
    return DatabaseManager.saveOrUpdateCollection(data, tmpDBName);
  }

  _replaceDB(dbName, tmpPath) {
    logger.log('_replaceDB');
    const dbPath = DatabaseManager.getDBFullPath(dbName);
    const backupPath = DatabaseManager.getDBFullPath(`${dbName}${Constants.BACKUP_FILE_EXTENSION}`);
    try {
      FileManager.deleteFileSync(backupPath);
      FileManager.renameSyncAllFullPaths(dbPath, backupPath);
      try {
        FileManager.renameSyncAllFullPaths(tmpPath, dbPath);
      } catch (e) {
        FileManager.renameSyncAllFullPaths(backupPath, dbPath);
        return e;
      }
      try {
        FileManager.deleteFileSync(backupPath);
      } catch (e) {
        logger.warn(e);
      }
    } catch (e) {
      return e;
    }
    this._remaining.delete(dbName);
    return null;
  }

  _processError(e) {
    logger.log('_processError');
    const msg = (e.message || `${e}`).toLowerCase();
    if (msg.includes('corrupt')) {
      this._status.healReason = SCC.REASON_DB_CORRUPTED;
    } else if (msg.includes('enospc')) {
      this._status.healReason = SCC.REASON_NO_DISK_SPACE;
    } else {
      this._status.healReason = e;
    }
    return Promise.reject(e);
  }

  _finalize(error) {
    logger.log('_finalize');
    DatabaseManager.setKey(this._actualKey);
    if (error) {
      logger.error(error);
      const reason = this._status.healReason || error;
      DatabaseCleanup.cleanupEnded(this._status, this._remaining, SCC.STATUS_FAIL, SCC.HEALED_BY_APP, reason);
    } else {
      DatabaseCleanup.cleanupEnded(this._status, this._remaining, SCC.STATUS_SUCCESS, SCC.HEALED_BY_APP);
    }
    return this._status;
  }
}
