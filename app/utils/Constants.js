const pkg = require('../../package.json');

export const SERVER_URL = '__SERVER_URL__';
export const BASE_REST_URL = '/rest';
export const PROTOCOL = '__SERVER_PROTOCOL__';
export const BASE_PORT = '__SERVER_PORT__';

export const CONNECTION_TIMEOUT = 25000;
export const CONNECTION_FORCED_TIMEOUT = CONNECTION_TIMEOUT + 5000;
export const TIMEOUT_CHECK_INTERVAL = 5000;
export const MAX_RETRY_ATEMPTS = 5;
export const ERRORS_TO_RETRY = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN'];
export const ERRORS_NO_AMP_SERVER = ['ECONNREFUSED', 'ENETUNREACH', 'ENOENT', 'ENOTFOUND', 'ENETDOWN', 'EHOSTDOWN',
  'EHOSTUNREACH', 'ENONET'];
export const CONNECTIVITY_CHECK_INTERVAL = '60000'; // 1 minutes

export const WORKSPACE_URL = '/workspace';
export const LOGIN_URL = '/';
export const DESKTOP_URL = '/desktop';
export const DESKTOP_CURRENT_URL = '/desktop/current';
export const SYNCUP_REDIRECT_URL = '/syncUp/sync';
export const SYNCUP_HISTORY_TARGET = 'history';
export const SYNCUP_SUMMARY_URL = '/syncUpSummary';
export const ACTIVITY_PREVIEW_URL = '/activity/preview';
export const ACTIVITY_EDIT_URL = '/activity/edit';
export const UPDATE_URL = '/update';
export const SETUP_URL = '/setup';
export const SETTINGS_URL = '/settings';

export const COLLECTION_USERS = 'users';
export const COLLECTION_WORKPACES = 'workspaces';
export const COLLECTION_TEAMMEMBERS = 'teammembers';
export const COLLECTION_CLIENT_SETTINGS = 'client-settings';
export const COLLECTION_GLOBAL_SETTINGS = 'global-settings';
export const COLLECTION_ACTIVITIES = 'activities';
export const COLLECTION_FIELDS = 'fields';
export const COLLECTION_POSSIBLE_VALUES = 'possible-values';
export const COLLECTION_SYNCUP_LOG = 'syncup-log';
export const COLLECTION_LANGS = 'languages';
export const COLLECTION_WS_SETTINGS = 'workspace-settings';
export const COLLECTION_CURRENCY_RATES = 'currency-rates';
export const COLLECTION_FEATURE_MANAGER = 'feature-manager';
export const COLLECTION_CONTACTS = 'contacts';
export const COLLECTION_RESOURCES = 'resources';
export const COLLECTION_REPOSITORY = 'repository';
export const COLLECTION_GAZETTEER = 'gazetteer';
export const COLLECTION_CALENDARS = 'calendars';
export const COLLECTION_CHANGESETS = 'changesets';

export const GAZETTEER_DISTANCE_DIVIDE = 3;

export const DB_FILE_PREFIX = 'database';
export const DB_FILE_EXTENSION = '.db';
export const DB_COMMON_DATASTORE_OPTIONS = { autoload: false, corruptAlertThreshold: 0 };
export const DB_AUTOCOMPACT_INTERVAL_MILISECONDS = 60000;
export const DB_DEFAULT_QUERY_LIMIT = 999999999;

export const LANGUAGE_ENGLISH = 'en';
export const FS_LOCALES_DIRECTORY = 'lang';
export const LANGUAGE_MASTER_TRANSLATIONS_FILE = 'master-translations';
export const LANGUAGE_TRANSLATIONS_FILE = 'translations';
export const LANGUAGE_NEW_TRANSLATIONS_MUST_SYNC = 'must_sync_translation.json';

export const ASAR_DIR = 'app.asar';
export const APP_DIRECTORY = 'app';
export const TEST_DIRECTORY = 'test';
export const STATIC_DIR = 'static';
export const IMAGES_DIR = 'images';
export const DOC_ICONS = 'doc-icons';
export const DB_STATIC_DIR = 'db';
export const MIGRATIONS_DIR = 'changelog';

export const HASH_ITERATIONS = 100;
export const DIGEST_ALGORITHM_SHA1 = 'SHA-1';
export const DIGEST_ALGORITHM_SHA256 = 'SHA-256';

export const ACTIVITY_EDIT = 'ACTIVITY_EDIT';
export const ACTIVITY_VIEW = 'ACTIVITY_VIEW';

export const SYNCUP_FORCE_DAYS = 14;
export const SYNCUP_BEST_BEFORE_DAYS = 7;
export const SYNCUP_NO_DATE = '1900-01-01T00:00:00.000+0000';
export const SYNCUP_TYPE_TRANSLATIONS = 'translations';
export const SYNCUP_TYPE_USERS = 'users';
export const SYNCUP_TYPE_ASSETS = 'assets';
export const SYNCUP_TYPE_WORKSPACES = 'workspaces';
export const SYNCUP_TYPE_GS = 'global-settings';
export const SYNCUP_TYPE_EXCHANGE_RATES = 'exchange-rates';
export const SYNCUP_TYPE_FEATURE_MANAGER = 'feature-manager';
export const SYNCUP_TYPE_WORKSPACE_MEMBERS = 'workspace-members';
export const SYNCUP_TYPE_ALL_FIELDS = 'fields';
export const SYNCUP_TYPE_ACTIVITIES_PULL = 'activities';
export const SYNCUP_TYPE_ACTIVITIES_PUSH = 'activities-push';
export const SYNCUP_TYPE_ACTIVITY_FIELDS = 'activity-fields';
export const SYNCUP_TYPE_ACTIVITY_FIELDS_STRUCTURAL_CHANGES = 'activity-fields-structural-changes';
export const SYNCUP_TYPE_CONTACTS_PULL = 'contacts';
export const SYNCUP_TYPE_CONTACTS_PUSH = 'contacts-push';
export const SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES = 'activity-possible-values-fields';
export const SYNCUP_TYPE_CONTACT_FIELDS = 'contact-fields';
export const SYNCUP_TYPE_CONTACT_FIELDS_STRUCTURAL_CHANGES = 'contact-fields-structural-changes';
export const SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES = 'contact-possible-values-fields';
export const SYNCUP_TYPE_RESOURCES_PULL = 'resources';
export const SYNCUP_TYPE_RESOURCES_PUSH = 'resources-push';
export const SYNCUP_TYPE_RESOURCE_FIELDS = 'resource-fields';
export const SYNCUP_TYPE_RESOURCE_FIELDS_STRUCTURAL_CHANGES = 'resource-fields-structural-changes';
export const SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES = 'resource-possible-values-fields';
export const SYNCUP_TYPE_COMMON_POSSIBLE_VALUES = 'common-possible-values-fields';
export const SYNCUP_TYPE_WORKSPACE_SETTINGS = 'workspace-settings';
export const SYNCUP_TYPE_MAP_TILES = 'map-tiles';
export const SYNCUP_TYPE_GAZETTEER = 'locators';
export const SYNCUP_TYPE_CALENDARS = 'calendars';

export const SYNCUP_STATUS_SUCCESS = 'SUCCESS';
export const SYNCUP_STATUS_FAIL = 'FAIL';
export const SYNCUP_STATUS_PARTIAL = 'PARTIAL';
export const SYNCUP_STATUS_CANCELED = 'CANCELED';
export const SYNCUP_SYNC_REQUESTED_AT = 'sync-date';
export const SYNCUP_SYNC_REQUESTED_BY = 'requested-by';
export const SYNCUP_DATETIME_FIELD = 'timestamp';
export const SYNCUP_DIFF_LEFTOVER = 'syncup-diff-leftover';
export const SYNCUP_DEPENDENCY_CHECK_INTERVAL = 10;
export const SYNCUP_DETAILS_SYNCED = 'synced';
export const SYNCUP_DETAILS_UNSYNCED = 'unsynced';
export const SYNCUP_RESOURCE_PULL_BATCH_SIZE = 100;
export const SYNCUP_ACTIVITIES_PULL_BATCH_SIZE = 100;
export const SYNCUP_CONTACTS_PULL_BATCH_SIZE = 100;

export const ACTIVITY_STATUS_DRAFT = 'ACTIVITY_STATUS_DRAFT';
export const ACTIVITY_STATUS_UNVALIDATED = 'ACTIVITY_STATUS_UNVALIDATED';
export const ACTIVITY_STATUS_VALIDATED = 'ACTIVITY_STATUS_VALIDATED';

export const CURRENCY_HOUR = '00:00';
export const DEFAULT_CURRENCY = 'USD';
export const RATE_SAME_CURRENCY = 1;
export const RATE_CURRENCY_NOT_FOUND = 1;
export const CURRENCY_PAIR = 'currency-pair';
export const VERSION = pkg.version;
export const VERSION_PATTERN = /(\d+)\.(\d+)(\.(\d+))?(-\w+)?/;
export const VERSION_PATTERN_GROUPS_TO_EXTRACT = [1, 2, 4, 5];
export const AMP_COUNTRY_LOGO = 'ampCountryFlag.png';
export const ASSETS_DIRECTORY = 'assets';
export const BASE_64_PNG_PREFIX = 'data:image/png;base64,';
// Holds the BASE64 representation of a a transparent image 1x1 in case we don't yet have the country flag
export const
  TRANSPARENT_FLAG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6zwAAAgcBApocMXEAAAAASUVORK5CYII=';
export const HELP_PDF_FILENAME = 'amp-help';
export const HELP_DIR = 'help';
export const ENDS_WITH_PUNCTUATION_REGEX = /[.!?,;:]$/;

export const MAP_TILES_DIR = 'map-tiles';
export const TILES_ZIP_FILE = 'map-tiles.zip';

/* eslint-disable max-len */
export const MAP_MARKER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=';
export const MAP_MARKER_SHADOW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC';
export const MAP_MARKER_CIRCLE_RED = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH4gcbFwogeohhEAAAA1lJREFUOMullc1rHGUcxz+/Z2Z20zGE7luyQbyIdiExre6aNvSySEBBKB71VAI5mGJA9g8QpR48aVGK6K160ptYD7Wxh4CUkJrFGpKyKWgQmnXfaZt9yWaeeTzsTExj1YO/0/DMzGd+b9/vCEH8cu51jsQQkAEmgFRwVgM2gRLQO/zwyatfAyCPgUWAV4A5YAZIAnZwzwPqwApwBfge6B+GyhFYGngXOA+4ABjzaN4i4VUH+BJ4D6iEh/YR2GfAawcgY1BPuFjDwwDo3V38dmcAFXGBBWAceDOEhsBIkNkA5vs4yQSx2Twjp3PY8dig3maL+6trtG4s49UboBTBO2XgbaBvXcg8B/Aq8D7g4PsMPfM0TxXews0+zx937vD78o9UNzbRjk3qpTwjL5yk++s2XqMZtmAC+BnYsoNpzgEuxuAkEzx5YZ6+Y1N85yK19Q2M5w3aZ9ukpibJFhYZX5jntw8+hGYrLH8OWFLBasyEfYvN5rHGRileukyleBuMQSwLsSwwhkrxNsVLl7HTo0TzZ+l6HsGYZoCMCtJNhgMYOZ2jvPoTtfUNlG0d3U2UbVFb36Bya434mWlqCjoDaBKYUMHS2gDW8DB2PEZr6+5BmY8L43k0S1u4yQS+e4ydTpuO1rZAyub/hgg97VHutjkeiaIYyMkL98xrtohlnkXsf/6W2DbxzAm69Qb9Bw8REXpa71d73apioM06IvjtDvdX1xiffpHU1CS+p/8G8z1NamqS9HSOezdX2G+3QQSBusCmYiD0lTD91o1ldKVKtrDIWPYUiGC0xmgNIoxlT5ErLLK7U2b72tJhKa44SpVCLZ8DvgLccLHHF+ax06NUbq3RLG0BEM+cID2dY3enzNpHn9As3UUGamlbIm/4xnwXAiPAx4E2wfchESeaP0v8zDRuMgFAt97g3s0Vtq8t0anWQhgCn0Ytq+Ab0z/sNmPA54fNoet51BT47jEQof/g4V89C0oV+MYStWAwFYU84jYVBq5RBs4j4rqOQ8rz2Kk16GkPETnICmgLfGGJuuhjKr4xxIei/22wAsmu1vZOt01P630JDFaJXHGUur7v+31tDPFIlJd/uMrBiP7tFyCQavT3qPa6VYFNR6nSntZ7jlIY4Hgkwuz1bwH4E5mCXIBLQ5HnAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE4LTA3LTI3VDIxOjEwOjMyKzAyOjAw7q6GnwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOC0wNy0yN1QyMToxMDozMiswMjowMJ/zPiMAAAAASUVORK5CYII=';
export const MAP_MARKER_CIRCLE_GREEN = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gcbFBg6/VhW4AAAA5VJREFUOMullUFoHFUYx3/vzexku8VkdzPrpgpWNJom4Jo0NaSnIkHrJRb1UFAsXmq3KlivJqCHhJ4qsQdtmksVFKQgYkTa0ErxUCMhad1CQrQ0DbaJ291kd91kJrs7M89DZpo0BBT8z2V47/F73/fe9/+ewFem9zCb1T8YDQMtQBuQ8IdzwDQwO9BXXNu8PjX6DQBiK6x/MGoAB4G3gG7ABHR/2gHywDhwDrg40FesboaKLbAm4CPgCBAB8PAeiFwig18L+BL4eKCvmN2YfxB2BkgDEY/1LyJ3kAyZJEMmEbmDYNzfMA0M9w9GkwFHZHoPB2l+6i/Aw6MxFKMntp+u+hRxvQGAZafEROkGlwtXyTuFzdGeAd4f6CtWg7M56KeJh0dzeDfHH32dpNbIxGKGS4WfAWiJNdO763m66lN8fvdrbq7NB9AjwI/AqHg5cywMfAW8GkT24WNp9KrG0NQImfwMjucAoEudlNnKib1HqeoVTs6dZZlSAP0WeEP6pdEdxN4T209Sa2RoaoTJ7HWUUmhCQxMaSikms9cZmhqhSX+YA3X7cG0HJRQ+o0X6dWYGF9BVn+LXxWtk8jPo0mCrdGmQyc8wkf2N7ngHIufiWDWUUCbQJv2i1QEe0nYS1xv4ozB3P83t5HgOvy/fwozEiXhhrIUynuXqSqiE5H9KInArDtZfZWpLFXTfTg5glN1Vlp0SLbFmdKmjlNoWokudp+NPkLOXKNXKCCFwbadmV1fuSd+beYnE8mwmSjd4bleKlNmK41W3SbdKymylq6mdX+5OslqzEEqAJA9MS2DW9yYAlwtXybpLnNh7lM5k+/ruysVVLkIIOpPtfND5NgsrWS7cvrIOW9e4NLRZ7fydZuennrANHBKI0Kpnc8v+k46GPfTufoEno4/zyM4kz5h7eOWpl3iz7TUKayVOTQ4zX76DFBJgVUjRf3zo75nAKRd9o6clkptr85ycO8uBun10xzt4NtG23rvsJc7P/sCF21fI2rkN60m+kIY2FpJyo9v4Bh8GDgUWdG0HkXOJeGEkglKtfP/MhBAB7DuhqfR7p62sRGy4229Bx3yjWxKJHgmhEho5d5kFK4vl2EhkAFtF8pnQVPrd01bWVYponfHvDVYJZbq2o9uLK7i2U/Nvc1wIcU4a2tg7n5SqrlLEjTpevDSK+C9PgBIqUVuqYOdW7gHT0tBm06eKlZCUKCBqGPSMfQ/APy1Xg2v6KIsFAAAAAElFTkSuQmCC';
/* eslint-enable max-len */
export const POLYGON_BASE_COLOR = '#3388ff';

export const DG_COMPANY_NAME = 'Development Gateway';
export const DG_ADDRESS_1 = '1110 Vermont Ave, NW, Suite 500';
export const DG_ADDRESS_2 = 'Washington, DC 20005 USA';
export const DG_CONTACT_INFO = 'info@developmentgateway.org, Tel: +1.202.572.9200, Fax: +1 202.572.9290';

export const LOG_DIR = 'logs';
export const LOG_FILE_NAME = 'ampoffline';
export const LOG_FILE_EXTENSION = 'log';

// Message constants
// total amount of time the message stays visible
export const MESSAGE_TIMEOUT = 10 * 1000;
// when it's this amount of time left, we nofity the user that the message is about to disappear
export const MESSAGE_DISAPPEAR_TIMEOUT = MESSAGE_TIMEOUT / 5;
export const MESSAGE_CHECK_INTERVAL = 100;
// how long should the enter/leave animation run(ms)
// (if you change this you'll wanna change it in style.css, too)
export const MESSAGE_ANIMATION_DURATION = 500;

// this is the internal date format used to store and sync up dates
export const INTERNAL_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
// currently supported max & min years in AMP, i.e. from 1970-01-01 till 2050-12-31
export const MIN_SUPPORTED_YEAR = 1970;
export const MAX_SUPPORTED_YEAR = 2050;

export const UPDATES_DIR = 'updates';
export const CONTENT_DISPOSITION_HEADER = 'Content-Disposition';
export const UPDATE_TMP_FILE = 'amp-offline-installer.tmp';

export const OTHER_ID = 999999999;
export const NR_SYNC_HISTORY_ENTRIES = 20;
export const NR_LOG_FILES = 100;
// https://en.wikipedia.org/wiki/ISO_8601#Durations, example: "P1Y2M10DT2H30M"
export const OLD_SYNC_LOGS_DURATION_ISO_8601 = 'P6M';
export const NR_OLD_SYNC_LOGS_TO_KEEP_MINIMUM = NR_SYNC_HISTORY_ENTRIES;

export const MASTER_BRANCH = 'master';
export const DEVELOP_BRANCH = 'develop';
export const RELEASE_BRANCH_REGEX = /release\//;
export const RELEASE_BRANCHES = [MASTER_BRANCH, RELEASE_BRANCH_REGEX];

export const DISABLE_CHANGELOGS = 'DISABLE_CHANGELOGS';
