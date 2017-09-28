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
        fallbackNS: 'common'
      },
      production: {
        lng: 'en',
        lngs: ['en'],
        fallbackLng: 'en',
        ns: [
          'translations'
        ],
        defaultNS: 'translations',
        fallbackNS: 'common'
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
