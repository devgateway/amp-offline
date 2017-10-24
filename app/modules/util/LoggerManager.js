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

  static bunyanLog = LoggerManager.initialize();

  static initialize() {
    console.log('initialize');
    fs.readdirSync(LOG_DIR).sort().reverse().slice(NR_LOG_FILES)
      .forEach(filename =>
               fs.unlink(path.join(LOG_DIR, filename)));

    const settings = LoggerSettings.getDefaultConfig(process.env.NODE_ENV);
    FileManager.createDataDir(LOG_DIR);
    const date = new Date();
    let file = `${LOG_FILE_NAME}.${date.toJSON().replace(/:|\./g, '-')}.${LOG_FILE_EXTENSION}`;
    file = FileManager.getFullPath(LOG_DIR, file);
    const log = bunyan.createLogger({
      name: 'amp',
      streams: [{ level: settings.level, path: file }
      ]
    });
    return log;
  }

  static log(message) {
    this.bunyanLog.info(message);
  }

  static debug(message) {
    this.bunyanLog.debug(message);
  }

  static warn(message) {
    this.bunyanLog.warn(message);
  }

  static error(message) {
    this.bunyanLog.error(message);
  }
}
