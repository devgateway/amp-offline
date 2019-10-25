import { Constants } from 'amp-ui';
import * as path from 'path';
import * as ERC from '../../utils/constants/ErrorReportConstants';
import DateUtils from '../../utils/DateUtils';
import * as DatabaseManager from '../database/DatabaseManager';
import Logger from '../util/LoggerManager';
import Archiver from '../archiver/Archiver';
import FileManager from '../util/FileManager';

const logger = new Logger('ErrorReportManager');

/**
 * @author Nadejda Mandrescu
 */
export default class ErrorReportManager {
  constructor(isEntireDB, specificDBNames = []) {
    this._isEntireDB = isEntireDB;
    this._specificDBNames = specificDBNames;
    this._arch = null;
    this._snapshots = [];
  }

  generate() {
    logger.log('generate');
    return this._generate().then((result) => {
      this._cleanup();
      return result;
    });
  }

  _generate() {
    try {
      this._init();
      this._addLogs();
      this._addDB();
      return this._generateArchive();
    } catch (err) {
      logger.error(`archive generation failed unexpectedly: ${err}`);
      return Promise.resolve();
    }
  }

  _init() {
    logger.log('_init');
    const timestamp = DateUtils.formatDate(new Date(), ERC.ERROR_REPORT_DATE_FORMAT);
    const archName = `${ERC.ERROR_REPORT_PREFIX}${timestamp}`;
    this._arch = new Archiver(ERC.ERROR_REPORTS_FOLDER, archName, `${archName}${ERC.ERROR_REPORT_ARCHIVE_SUFFIX}`);
  }

  _addLogs() {
    logger.log('_addLogs');
    const currentLog = Logger.logPath;
    const currentLogName = currentLog ? path.basename(currentLog) : null;
    if (currentLogName) {
      const snapshotLogName = `${currentLogName}.snapshot`;
      FileManager.copyDataFileSync(currentLog, Constants.LOG_DIR, snapshotLogName);
      this._snapshots.push(FileManager.getFullPath(Constants.LOG_DIR, snapshotLogName));
    }
    const testFunc = (file) => file !== currentLogName;
    this._arch.addFolder(testFunc, Constants.LOG_DIR);
  }

  _addDB() {
    logger.log('_addDB');
    if (this._isEntireDB) {
      logger.log('adding entire DB');
      // TODO for other than sanity use case: take snapshot of all/other DB files that can be "changing"
      this._takeDBSnapshot(Constants.COLLECTION_SANITY_CHECK);
      const excludeDB = DatabaseManager.getDBPathParts(Constants.COLLECTION_SANITY_CHECK).pop();
      const filterFunc = (file) => file !== excludeDB;
      this._arch.addFolder(filterFunc, Constants.DB_FILE_PREFIX);
    } else if (this._specificDBNames.length) {
      logger.log(`adding specific DB files: ${this._specificDBNames}`);
      this._specificDBNames.forEach(dbName => this._arch.addFile(...this._takeDBSnapshot(dbName)));
    } else {
      logger.log('no DB added');
    }
  }

  _takeDBSnapshot(dbName) {
    logger.log(`_takeDBSnapshot: ${dbName}`);
    const tmpDBParts = DatabaseManager.getDBPathParts(`${dbName}${Constants.TMP_FILE_EXTENSION}`);
    FileManager.copyDataFileSync(DatabaseManager.getDBFullPath(dbName), ...tmpDBParts);
    this._snapshots.push(FileManager.getFullPath(...tmpDBParts));
    return tmpDBParts;
  }

  _generateArchive() {
    logger.log(`generating the archive ${this._arch.fullArchivePath}`);
    return this._arch.generateZip()
      .then(() => {
        logger.log('archive complete');
        return path.dirname(this._arch.fullArchivePath);
      })
      .catch(error => {
        logger.error(`archive generation failed: ${error}`);
        return null;
      });
  }

  _cleanup() {
    logger.log('_cleanup');
    try {
      this._snapshots.forEach(FileManager.deleteFile);
    } catch (error) {
      logger.warn(error);
    }
  }
}
