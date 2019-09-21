import FileManager from '../util/FileManager';
import { DB_FILE_PREFIX, LOG_DIR } from '../../utils/Constants';

/**
 * Application setup utility
 * @author Nadejda Mandrescu
 */
const SetupConfig = {
  getLogsDir() {
    return FileManager.getFullPath(LOG_DIR);
  },

  getDatabaseDir() {
    return FileManager.getFullPath(DB_FILE_PREFIX);
  }
};

export default SetupConfig;
