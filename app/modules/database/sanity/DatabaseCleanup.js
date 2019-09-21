import DatabaseSanityStatus from './DatabaseSanityStatus';
import * as SCC from '../../../utils/constants/SanityCheckConstants';
import { COLLECTION_SANITY_CHECK } from '../../../utils/Constants';
import FileManager from '../../util/FileManager';
import DateUtils from '../../../utils/DateUtils';
import Logger from '../../util/LoggerManager';
import * as DatabaseManager from '../DatabaseManager';

const logger = new Logger('DatabaseCleanup');

/**
 * @author Nadejda Mandrescu
 */
export default class DatabaseCleanup {
  constructor(status: DatabaseSanityStatus, allDBNames: Array<string>) {
    logger.log('constructor');
    this.status = status;
    this.remainingDBs = new Set(status.details.remainingCorruptedDBNames);
    if (!this.remainingDBs.has(COLLECTION_SANITY_CHECK)) {
      this.allDBNames = allDBNames.filter(n => n !== COLLECTION_SANITY_CHECK);
    } else {
      this.allDBNames = allDBNames;
    }
  }

  run() {
    logger.log('run');
    // no partial cleanup -> will resync all than handle various use cases for partial resync
    try {
      this.allDBNames.forEach(dbName => {
        logger.log(`deleting ${dbName}`);
        const fullFileName = DatabaseManager.getDBFullPath(dbName);
        FileManager.deleteFileSync(fullFileName);
        if (FileManager.existsSync(fullFileName)) {
          throw new Error(`File is in use and could not be deleted: ${fullFileName}`);
        }
        this.remainingDBs.delete(dbName);
        if (COLLECTION_SANITY_CHECK === dbName) {
          this.status.isSanityDBCorrupted = false;
        }
      });
      this._cleanupEnded(SCC.STATUS_SUCCESS, SCC.HEALED_BY_APP, SCC.REASON_HEALED);
      logger.log('DB Cleanup completed successfully');
    } catch (e) {
      logger.error(`DB Cleanup failed: ${e}`);
      this._cleanupEnded(SCC.STATUS_FAIL, SCC.HEALED_BY_APP, e);
    }
    return status;
  }

  _cleanupEnded(resultStatus, endedBy, reason) {
    DatabaseCleanup.cleanupEnded(this.status, this.remainingDBs, resultStatus, endedBy, reason);
  }

  static cleanupEnded(status, remainingDBs, resultStatus, endedBy, reason) {
    status.healStatus = resultStatus;
    status.healedAt = DateUtils.getTimestampForAPI();
    status.healedBy = endedBy;
    status.healReason = reason;
    status.details.remainingCorruptedDBNames = Array.from(remainingDBs);
  }
}
