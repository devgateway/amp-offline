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
import * as ElectronApp from './ElectronApp';

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
    }
    return this.bunyanLog;
  }

  constructor(module) {
    if (ElectronApp.IS_TEST_MODE && ElectronApp.IS_LOG_TO_CONSOLE) {
      this.logger_ = console;
      this._format = (message) => `${module}: ${message}`;
      // no .debug in node.js console
      this.debug = (message) => console.info(this._format(message));
    } else {
      this.logger_ = this.constructor.getBunyanLog().child({ module });
      this._format = (message) => message;
      if ((!ElectronApp.IS_DEV_MODE && !ElectronApp.IS_TEST_MODE) || ElectronApp.IS_FORCE_LOGGER) {
        console.error = this.error.bind(this);
        console.warn = this.warn.bind(this);
        console.log = this.log.bind(this);
        console.info = this.log.bind(this);
        console.debug = this.debug.bind(this);
      }
    }
  }

  log(message) {
    this.logger_.info(this._format(message));
  }

  info(message) {
    this.logger_.info(this._format(message));
  }

  debug(message) {
    this.logger_.debug(this._format(message));
  }

  warn(message) {
    this.logger_.warn(this._format(message));
  }

  error(message) {
    this.logger_.error(this._format(message));
  }
}
