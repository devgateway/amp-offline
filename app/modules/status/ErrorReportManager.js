import * as path from 'path';
import * as ERC from '../../utils/constants/ErrorReportConstants';
import DateUtils from '../../utils/DateUtils';
import { DB_FILE_PREFIX, LOG_DIR } from '../../utils/Constants';
import * as DatabaseManager from '../database/DatabaseManager';
import Logger from '../util/LoggerManager';
import Archiver from '../archiver/Archiver';

const logger = new Logger('ErrorReportManager');

/**
 * @author Nadejda Mandrescu
 */
export default class ErrorReportManager {
  constructor(isEntireDB, specificDBNames = []) {
    this._isEntireDB = isEntireDB;
    this._specificDBNames = specificDBNames;
  }

  generate() {
    logger.log('generate');
    try {
      const timestamp = DateUtils.formatDate(new Date(), ERC.ERROR_REPORT_DATE_FORMAT);
      const archName = `${ERC.ERROR_REPORT_PREFIX}${timestamp}`;
      const arch = new Archiver(ERC.ERROR_REPORTS_FOLDER, archName, `${archName}${ERC.ERROR_REPORT_ARCHIVE_SUFFIX}`);
      logger.log('adding logs');
      arch.addFolder(null, LOG_DIR);
      if (this._isEntireDB) {
        logger.log('adding entire DB');
        arch.addFolder(null, DB_FILE_PREFIX);
      } else if (this._specificDBNames.length) {
        logger.log(`adding specific DB files: ${this._specificDBNames}`);
        this._specificDBNames.forEach(dbName => {
          arch.addFile(...DatabaseManager.getDBPathParts(dbName));
        });
      }
      logger.log(`generating the archive ${arch.fullArchivePath}`);
      return arch.generateZip()
        .then(() => {
          logger.log('archive complete');
          return path.dirname(arch.fullArchivePath);
        })
        .catch(error => {
          logger.error(`archive generation failed: ${error}`);
          return null;
        });
    } catch (err) {
      logger.error(`archive generation failed unexpectedly: ${err}`);
      return Promise.resolve();
    }
  }
}
