import winston from 'winston';
import ElectronConsole from 'winston-electron';

export const logger = new (winston.Logger)({
  transports: [
    new ElectronConsole({
      level: 'info',
      handleExceptions: true
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'ampoffline-info.log',
      maxsize: 1024 * 1024 * 10 // 10MB
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'ampoffline-exceptions.log'
    })
  ]
});

const LoggerManager = {

  initialize() {
    logger.info('initialize');
    return Promise.resolve();
  },

  log(message) {
    logger.info(message);
  },

  debug(message) {
    logger.debug(message);
  },

  warn(message) {
    logger.warn(message);
  },

  error(message) {
    logger.error(message);
  }
};

export default LoggerManager;
