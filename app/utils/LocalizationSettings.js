const defaultI18NextConfig = {
  I18N: {
    OPTIONS: {
      development: {
        lng: 'en',
        lngs: ['en'],
        fallbackLng: 'en',
        ns: [
          'translations'
        ],
        defaultNS: 'translations',
        fallbackNS: 'common',
        backend: {
          loadPath: './lang/{{ns}}.{{lng}}.json'
        }
      },
      production: {
        lng: 'en',
        lngs: ['en'],
        fallbackLng: 'en',
        ns: [
          'translations'
        ],
        defaultNS: 'translations',
        fallbackNS: 'common',
        backend: {
          loadPath: './lang/{{ns}}.{{lng}}.json'
        }
      },
      test: {
        lng: 'en',
        lngs: ['en'],
        fallbackLng: 'en',
        ns: [
          'translations'
        ],
        defaultNS: 'translations',
        fallbackNS: 'common',
        backend: {
          loadPath: './lang/{{ns}}.{{lng}}.json'
        }
      }
    }
  }
};

const LocalizationSettings = {

  getDefaultConfig() {
    return defaultI18NextConfig;
  }
};

module.exports = LocalizationSettings;
