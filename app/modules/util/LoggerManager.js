import log from 'electron-log';
import stacktrace from 'stack-trace';
import fs from 'fs';
import { LOG_FILE } from '../../utils/Constants';

const LoggerManager = {

  initialize() {
    console.log('initialize');
    log.transports.console.level = 'info';
    log.transports.console.format = '{h}:{i}:{s}:{ms} {level} {text}';

    log.transports.file.level = 'info';
    log.transports.file.format = '{h}:{i}:{s}:{ms} {level} {text}';
    /* Set approximate maximum log size in bytes. When it exceeds,
     the archived log will be saved as the log.old.log file. */
    log.transports.file.maxSize = 5 * 1024 * 1024;
    log.transports.file.file = `${__dirname}/${LOG_FILE}`;
    log.transports.file.streamConfig = { flags: 'w' };
    log.transports.file.stream = fs.createWriteStream(LOG_FILE);
    return Promise.resolve();
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
