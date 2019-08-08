import bunyan from 'bunyan';
import path from 'path';
import {
  LOG_DIR,
  LOG_FILE_EXTENSION,
  LOG_FILE_NAME,
  NR_LOG_FILES
} from '../../utils/Constants';
import LoggerSettings from '../../utils/LoggerSettings';
import FileManager from './FileManager';

/* To understand the levels: https://github.com/trentm/node-bunyan#levels
 * 30: info
 * 40: warn
 * 50: error */
export default class LoggerManager {
  static bunyanLog = null;

  static getBunyanLog() {
    if (!this.bunyanLog) {
      console.log('initialize');
      const settings = LoggerSettings.getDefaultConfig(process.env.NODE_ENV);
      const logDirFullPath = FileManager.createDataDir(LOG_DIR);

      FileManager.readdirSync(LOG_DIR)
        .sort()
        .reverse()
        .slice(NR_LOG_FILES)
        .forEach(filename => FileManager.deleteFileSync(path.join(logDirFullPath, filename)));

      const date = new Date();
      let file = `${LOG_FILE_NAME}.${date.toJSON().replace(/:|\./g, '-')}.${LOG_FILE_EXTENSION}`;
      file = FileManager.getFullPath(LOG_DIR, file);
      this.bunyanLog = bunyan.createLogger({
        name: 'amp',
        streams: [{ level: settings.level, path: file }
        ]
      });
      this.bunyanLog.info('LoggerManager initialized');
    }
    return this.bunyanLog;
  }

  constructor(module) {
    this.logger_ = this.constructor.getBunyanLog().child({ module });
  }

  log(message) {
    this.logger_.info(message);
  }

  info(message) {
    this.logger_.info(message);
  }

  debug(message) {
    this.logger_.debug(message);
  }

  warn(message) {
    this.logger_.warn(message);
  }

  error(message) {
    this.logger_.error(message);
  }
}
