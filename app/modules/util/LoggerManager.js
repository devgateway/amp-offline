import bunyan from 'bunyan';
import fs from 'fs';
import { LOG_FILE_NAME, LOG_DIR, LOG_FILE_EXTENSION } from '../../utils/Constants';

/* To understand the levels: https://github.com/trentm/node-bunyan#levels
 * 30: info
 * 40: warn
 * 50: error */
export default class LoggerManager {

  static bunyanLog = LoggerManager.initialize();

  static initialize() {
    console.log('initialize');
    // Create directory.
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR);
    }
    const date = new Date();
    const file = `${LOG_DIR}/${LOG_FILE_NAME}.${date.toJSON().replace(/:|\./g, '-')}.${LOG_FILE_EXTENSION}`;
    const log = bunyan.createLogger({
      name: 'amp',
      streams: [{ level: 'info', path: file }
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
