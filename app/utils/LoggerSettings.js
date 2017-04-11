const defaultLoggerConfig = {
  Logger: {
    development: {
      level: 'debug',
      format: '{h}:{i}:{s}:{ms} {level} {text}'
    },
    production: {
      level: 'info',
      format: '{h}:{i}:{s}:{ms} {level} {text}'
    },
    test: {
      level: 'info',
      format: '{h}:{i}:{s}:{ms} {level} {text}'
    }
  }
};

const LoggerSettings = {

  getDefaultConfig(env) {
    return defaultLoggerConfig.Logger[env];
  }
};

module.exports = LoggerSettings;
