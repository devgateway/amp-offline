const defaultLoggerConfig = {
  Logger: {
    development: {
      level: 'debug'
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
