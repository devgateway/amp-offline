import bunyan from 'bunyan';
import fs from 'fs';
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
      fs.readdirSync(LOG_DIR).sort().reverse().slice(NR_LOG_FILES)
        .forEach(filename =>
          fs.unlink(path.join(LOG_DIR, filename)));

      const settings = LoggerSettings.getDefaultConfig(process.env.NODE_ENV);
      FileManager.createDataDir(LOG_DIR);
      const date = new Date();
      let file = `${LOG_FILE_NAME}.${date.toJSON().replace(/:|\./g, '-')}.${LOG_FILE_EXTENSION}`;
      file = FileManager.getFullPath(LOG_DIR, file);
      this.bunyanLog = bunyan.createLogger({
        name: 'amp',
        streams: [{ level: settings.level, path: file }
        ]
      });
    }
    return this.bunyanLog;
  }

  constructor(module) {
    this.logger = this.constructor.getBunyanLog().child({ module });
  }

  log(message) {
    this.logger.info(message);
  }

  debug(message) {
    this.logger.debug(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(message) {
    this.logger.error(message);
  }
}
