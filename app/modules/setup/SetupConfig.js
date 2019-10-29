import { Constants } from 'amp-ui';
import FileManager from '../util/FileManager';

/**
 * Application setup utility
 * @author Nadejda Mandrescu
 */
const SetupConfig = {
  getLogsDir() {
    return FileManager.getFullPath(Constants.LOG_DIR);
  },

  getDatabaseDir() {
    return FileManager.getFullPath(Constants.DB_FILE_PREFIX);
  }
};

export default SetupConfig;
