const defaultLoggerConfig = {
  Logger: {
    development: {
      level: 'info',
      /* List of files where to print debug messages if debug level is configured. If undefined, then none will be kept.
      If defined as an empty list, then the debug logs will be printed in all fields.
       */
      keepDebugLogsFor: ['Login.jsx']
    },
    production: {
      level: 'info'
    },
    test: {
      level: 'info'
    }
  }
};

const LoggerSettings = {

  getDefaultConfig(env) {
    return defaultLoggerConfig.Logger[env];
  }
};

module.exports = LoggerSettings;
