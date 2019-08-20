import DatabaseSanityStatus from './DatabaseSanityStatus';
import Logger from '../../util/LoggerManager';
import FileManager from '../../util/FileManager';
import {
  BACKUP_FILE_EXTENSION,
  COLLECTION_SANITY_CHECK,
  DB_FILE_EXTENSION,
  DB_FILE_PREFIX,
  TMP_FILE_EXTENSION,
  VERSION
} from '../../../utils/Constants';
import * as DatabaseManager from '../DatabaseManager';
import DatabaseSanityStatusDetails from './DatabaseSanityStatusDetails';
import SanityStatusHelper from '../../helpers/SanityStatusHelper';
import * as SCC from '../../../utils/constants/SanityCheckConstants';
import DateUtils from '../../../utils/DateUtils';
import DatabaseCleanup from './DatabaseCleanup';
import VersionUtils from '../../../utils/VersionUtils';
import DatabaseTransition from './DatabaseTransition';
import * as Utils from '../../../utils/Utils';
import ErrorReportManager from '../../status/ErrorReportManager';

const logger = new Logger('DatabaseSanityManager');

const VERSIONS_WITH_POSSIBLE_DB_INCOMPATIBILITY_POST_UPGRADE = [
  '1.0.1',
  '1.3.1',
  '1.4.0',
];

/**
 * @author Nadejda Mandrescu
 */
const DatabaseSanityManager = {

  /**
   * @returns {Promise<DatabaseSanityStatus>}
   */
  sanityCheck() {
    logger.log('sanityCheck');
    return this._findOrCreateSanityStatus()
      .then(this.validateDatabase);
  },

  validateDatabase(status: DatabaseSanityStatus) {
    logger.log('validateDatabase');
    const dbNames = DatabaseSanityManager.findAllDBNames();
    const totalDBFilesValidated = dbNames.length;
    let nonSanityDBsWithDataCount = 0;
    const flagInvalidDBPromises = dbNames.map(
      dbName => DatabaseManager.count({}, dbName)
        .then((entriesCount) => {
          if (dbName !== COLLECTION_SANITY_CHECK && entriesCount) {
            // at this moment no .db is anyhow changed, hence this _may_ mean a cleanup leftover
            nonSanityDBsWithDataCount += 1;
          }
          return null;
        })
        .catch(() => dbName));

    logger.log(`Found ${totalDBFilesValidated} DBs to validate: ${dbNames}`);

    return Promise.all(flagInvalidDBPromises)
      .then(result => result.filter(name => name))
      .then(invalidDBs => DatabaseSanityManager._initOrUpdateStatus(
        status, invalidDBs, totalDBFilesValidated, nonSanityDBsWithDataCount));
  },

  _initOrUpdateStatus(status: DatabaseSanityStatus, invalidDBs, totalDBFilesValidated, nonSanityDBsWithDataCount) {
    logger.log('_initOrUpdateStatus');
    const currentDateTime = DateUtils.getTimestampForAPI();
    const isDBCurrentlyInvalid = !!invalidDBs.length;

    if (isDBCurrentlyInvalid) {
      logger.error(`Found ${invalidDBs.length} corrupted DB files: ${invalidDBs}`);
    } else {
      logger.log('No invalid DB file detected');
    }
    if (!status.details) {
      status.details = new DatabaseSanityStatusDetails(invalidDBs, totalDBFilesValidated);
    }
    status.details.remainingCorruptedDBNames = invalidDBs;

    const isSaveToDB = status.isPostUpgrade || status.isDBIncompatibilityDetected || isDBCurrentlyInvalid;

    if (status.isDBIncompatibilityDetected === undefined) {
      status.isDBIncompatibilityDetected = isDBCurrentlyInvalid;
      status.validatedAt = currentDateTime;
    } else if (status.isDBIncompatibilityDetected) {
      if (nonSanityDBsWithDataCount) {
        logger.warn('Cleanup did not complete and will be resumed');
      } else if (!isDBCurrentlyInvalid) {
        status.healedAt = currentDateTime;
        status.healedBy = SCC.HEALED_BY_USER;
        status.healStatus = SCC.STATUS_SUCCESS;
        status.details.remainingCorruptedDBNames = [];
      }
    }
    if (isSaveToDB) {
      if (status.isStandard && !status.details.errorReportPath) {
        const errorReport = new ErrorReportManager(false);
        return errorReport.generate().then(errorReportPath => {
          status.details.errorReportPath = errorReportPath;
          return DatabaseSanityManager._saveOrUpdate(status);
        });
      }
      return DatabaseSanityManager._saveOrUpdate(status);
    }
    return status;
  },

  /**
   * @returns {[string]} a list of app must DB files; all these DBs will be deleted during cleanup
   */
  findAllDatabaseFiles() {
    logger.log('findAllDatabaseFiles');
    return FileManager.readdirSync(DB_FILE_PREFIX)
      .filter(f => f.endsWith(DB_FILE_EXTENSION) &&
        [TMP_FILE_EXTENSION, BACKUP_FILE_EXTENSION].every(ext => !f.includes(ext)));
  },

  /**
   * @returns {[string]} a list of DB names to check for data corruption; all these DBs will be deleted during cleanup
   */
  findAllDBNames() {
    logger.log('findAllDBNames');
    return DatabaseSanityManager.findAllDatabaseFiles()
      .map(f => f.substring(0, f.length - DB_FILE_EXTENSION.length));
  },

  _findOrCreateSanityStatus() {
    logger.log('_findOrCreateSanityStatus');
    return this.getPostUpgradeStatus()
      .then(this._usePostUpgradeSanityOrStandard);
  },

  /**
   * @returns {Promise<DatabaseSanityStatus>}
   */
  getPostUpgradeStatus() {
    logger.log('getPostUpgradeStatus');
    return DatabaseSanityManager._isCheckPostUpgradeSanityStatus()
      .then(result => {
        if (result) {
          return Promise.all([
            SanityStatusHelper.findCurrentVersionPostUpgradeStatus()
              .then(DatabaseSanityStatus.fromDB),
            SanityStatusHelper.findAllOtherFixedVersions()
          ])
            .then(([status, otherFixedVersions]) => {
              if (!status) {
                status = new DatabaseSanityStatus(SCC.TYPE_POST_UPGRADE);
                status.isDBIncompatibilityExpected =
                  DatabaseSanityManager._isIncompatibilityExpected(otherFixedVersions);
                return DatabaseSanityManager._saveOrUpdate(status);
              }
              return status;
            })
            .catch((error) => {
              logger.error(error);
              return null;
            });
        }
        return null;
      });
  },

  /**
   * 1) The app may be running for a while, then at some point sanity db gets corrupted. It is cleaned up using a
   * standard status. => We shouldn't restart post upgrade cleanup.
   * 2) The sanity DB is corrupted => we should proceed with standard cleanup
   * @returns {boolean} if we should check for post upgrade cleanup
   */
  _isCheckPostUpgradeSanityStatus() {
    logger.log('_isCheckPostUpgradeSanityStatus');
    if (!Utils.isReleaseBranch()) {
      return Promise.resolve(false);
    }
    return SanityStatusHelper.hasCurrentVersionStandardStatus()
      .then(result => !result)
      .catch(error => {
        logger.error(error);
        return false;
      });
  },

  _isIncompatibilityExpected(otherFixedVersions: Array<string>) {
    logger.log('_isIncompatibilityExpected');
    // the code must stores versions <= upgraded version; filtering in case future versions are defined by accident
    const mayBeIncompatibleVersions = VERSIONS_WITH_POSSIBLE_DB_INCOMPATIBILITY_POST_UPGRADE
      .filter(v => VersionUtils.compareVersion(v, VERSION) <= 0);
    if (!mayBeIncompatibleVersions.length) {
      logger.error('Possible incompatible versions are misconfigured. DB incompatibility not expected.');
      return false;
    }
    if (!otherFixedVersions.length) {
      logger.log('No other versions fixed before. DB incompatibility is possible.');
      return true;
    }
    otherFixedVersions = Array.from(new Set(otherFixedVersions));
    const possibleIncompatibility = mayBeIncompatibleVersions.filter(sinceV =>
      otherFixedVersions.every((otherV: string) => VersionUtils.compareVersion(sinceV, otherV) > 0)
    ).length > 0;
    logger.log(`DB incompatibility ${possibleIncompatibility ? 'is possible' : 'not expected'}.`);
    return possibleIncompatibility;
  },

  _usePostUpgradeSanityOrStandard(postUpgrade: DatabaseSanityStatus) {
    logger.log('_usePostUpgradeSanityOrStandard');
    // force post upgrade healing until success
    if (postUpgrade && postUpgrade.isDBIncompatibilityExpected &&
      (postUpgrade.isDBIncompatibilityDetected === undefined ||
        (postUpgrade.isDBIncompatibilityDetected && !postUpgrade.isHealedSuccessfully))) {
      logger.log('Validating for post upgrade incompatibility');
      return postUpgrade;
    }
    logger.log('Checking for possible database corruptions');
    return DatabaseSanityManager.getStandardStatus();
  },

  getStandardStatus() {
    logger.log('getStandardStatus');
    return DatabaseSanityManager._getPendingStandardStatus()
      .then((standardStatus: DatabaseSanityStatus) => {
        if (!standardStatus) {
          standardStatus = new DatabaseSanityStatus(SCC.TYPE_STANDARD);
        }
        return standardStatus;
      });
  },

  _getPendingStandardStatus() {
    return SanityStatusHelper.findCurrentVersionPendingStandardStatus()
      .then(DatabaseSanityStatus.fromDB)
      .catch(error => {
        logger.error(error);
        const standardStatus = new DatabaseSanityStatus(SCC.TYPE_STANDARD);
        standardStatus.isSanityDBCorrupted = true;
        return standardStatus;
      });
  },

  cleanupDB(status: DatabaseSanityStatus) {
    logger.warn('cleanupDB');
    status.healStatus = SCC.STATUS_IN_PROGRESS;
    return DatabaseSanityManager._saveOrUpdate(status)
      .then(() => {
        const dbCleanup = new DatabaseCleanup(status, DatabaseSanityManager.findAllDBNames());
        dbCleanup.run();
        if (status.isHealFailed) {
          const errorReport = new ErrorReportManager(false, [COLLECTION_SANITY_CHECK]);
          return errorReport.generate().then(errorReportPath => {
            status.details.failureErrorReportPath = errorReportPath;
            return DatabaseSanityManager._saveOrUpdate(status);
          });
        }
        return DatabaseSanityManager._saveOrUpdate(status);
      });
  },

  cancelDBCleanup(status: DatabaseSanityStatus) {
    logger.warn('cancelDBCleanup');
    DatabaseCleanup.cleanupEnded(
      status, status.details.remainingCorruptedDBNames, SCC.STATUS_CANCELED, SCC.HEALED_BY_USER);
    return DatabaseSanityManager._saveOrUpdate(status);
  },

  _saveOrUpdate(status: DatabaseSanityStatus) {
    logger.log(`_saveOrUpdate, isSanityDBCorrupted=${status.isSanityDBCorrupted}`);
    if (status.isSanityDBCorrupted) {
      return Promise.resolve(status);
    }
    return SanityStatusHelper.saveOrUpdate(status)
      .then(DatabaseSanityStatus.fromDB);
  },

  /**
   * @param s the latest sanity status
   * @returns {Promise<DatabaseSanityStatus>} the same sanity status provided as input param
   */
  attemptTransition(s: DatabaseSanityStatus) {
    logger.log('attemptTransition');
    if (s.isPostUpgrade && s.isDBIncompatibilityDetected && s.isHealNotStarted) {
      return DatabaseSanityManager._getTransitionStatus(s)
        .then((tStatus: DatabaseSanityStatus) => {
          if (!tStatus.healReason || SCC.TRANSITION_CAN_RETRY_ON_REASONS.includes(tStatus.healReason)) {
            return DatabaseSanityManager._doTransition(s, tStatus);
          }
          logger.log('Cannot retry the transition. It failed in the past for unhandled reasons.');
          return s;
        });
    }
    logger.log('Transition not applicable');
    return s;
  },

  _getTransitionStatus(s: DatabaseSanityStatus) {
    logger.log('_getTransitionStatus');
    return SanityStatusHelper.findCurrentVersionTransitionStatus()
      .then(DatabaseSanityStatus.fromDB)
      .then((tStatus: DatabaseSanityStatus) => {
        const d = s.details;
        if (!tStatus) {
          tStatus = new DatabaseSanityStatus(SCC.TYPE_TRANSITION);
          tStatus.details = new DatabaseSanityStatusDetails(d.corruptedDBNames.slice(), d.totalDBFilesFound);
          tStatus.details.remainingCorruptedDBNames = d.remainingCorruptedDBNames.slice();
        } else {
          tStatus.details.remainingCorruptedDBNames = d.remainingCorruptedDBNames.slice();
        }
        return DatabaseSanityManager._saveOrUpdate(tStatus);
      });
  },

  _doTransition(s: DatabaseSanityStatus, tStatus: DatabaseSanityStatus) {
    logger.log('_doTransition');
    const dbT = new DatabaseTransition(tStatus);
    return dbT.run()
      .then(DatabaseSanityManager._saveOrUpdate)
      .then(() => {
        if (tStatus.isHealedSuccessfully) {
          DatabaseCleanup.cleanupEnded(s, [], SCC.STATUS_SUCCESS, SCC.HEALED_BY_APP, SCC.REASON_TRANSITIONED);
          return DatabaseSanityManager._saveOrUpdate(s);
        } else {
          s.healReason = tStatus.healReason;
        }
        return s;
      });
  },
};

export default DatabaseSanityManager;
