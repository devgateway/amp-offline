import log from 'electron-log';
import stacktrace from 'stack-trace';
import fs from 'fs';
import { LOG_FILE_NAME, LOG_DIR, LOG_FILE_EXTENSION } from '../../utils/Constants';

const LoggerManager = {

  initialize() {
    console.log('initialize');
    log.transports.console.level = 'info';
    log.transports.console.format = '{h}:{i}:{s}:{ms} {level} {text}';

    // Create directory.
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR);
    }
    const date = new Date();
    const file = `${LOG_DIR}/${LOG_FILE_NAME}.${date.getTime()}.${LOG_FILE_EXTENSION}`;
    log.transports.file.level = 'info';
    log.transports.file.format = '{h}:{i}:{s}:{ms} {level} {text}';
    /* Set approximate maximum log size in bytes. When it exceeds,
     the archived log will be saved as the log.old.log file. */
    log.transports.file.maxSize = 5 * 1024 * 1024;
    log.transports.file.file = file;
    log.transports.file.streamConfig = { flags: 'w' };
    log.transports.file.stream = fs.createWriteStream(file);
  },

  log(message) {
    const stack = stacktrace.get();
    log.info(stack[1].getLineNumber(), message);
  },

  debug(message) {
    const stack = stacktrace.get();
    log.debug(stack[1].getLineNumber(), message);
  },

  warn(message) {
    const stack = stacktrace.get();
    log.warn(stack[1].getLineNumber(), message);
  },

  error(message) {
    const stack = stacktrace.get();
    log.error(stack[1].getLineNumber(), message);
  }
};

export default LoggerManager;
