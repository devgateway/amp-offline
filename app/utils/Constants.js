export const SERVER_URL = '__SERVER_URL__';
export const BASE_REST_URL = '/rest';
export const PROTOCOL = '__SERVER_PROTOCOL__';
export const BASE_PORT = '__SERVER_PORT__';

export const CONNECTION_TIMEOUT = '5000';
export const MAX_RETRY_ATEMPTS = 5;
export const ERRORS_TO_RETRY = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET'];
export const ERROR_NO_AMP_SERVER = 'ECONNREFUSED';
export const CONNECTIVITY_CHECK_INTERVAL = '60000'; // 1 minutes

export const WORKSPACE_URL = '/workspace';
export const LOGIN_URL = '/';
export const DESKTOP_URL = '/desktop';
export const DESKTOP_CURRENT_URL = '/desktop/current';
export const SYNCUP_URL = '/syncUp';
export const ACTIVITY_PREVIEW_URL = '/activity/preview';
export const ACTIVITY_EDIT_URL = '/activity/edit';

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

export const DB_FILE_PREFIX = './database/';
export const DB_FILE_EXTENSION = '.db';
// TODO: Find a better way to store the key.
export const AKEY = 'key';
export const DB_COMMON_DATASTORE_OPTIONS = { autoload: false, corruptAlertThreshold: 0 };
export const DB_AUTOCOMPACT_INTERVAL_MILISECONDS = 60000;
export const DB_DEFAULT_QUERY_LIMIT = 999999999;

export const LANGUAGE_ENGLISH = 'en';
export const FS_LOCALES_DIRECTORY = './lang/';
export const LANGUAGE_MASTER_TRANSLATIONS_FILE = 'master-translations';
export const LANGUAGE_TRANSLATIONS_FILE = 'translations';
export const APP_DIRECTORY = './app/';

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
export const SYNCUP_TYPE_ACTIVITIES_PULL = 'activities';
export const SYNCUP_TYPE_ACTIVITIES_PUSH = 'activities-push';
export const SYNCUP_TYPE_FIELDS = 'fields';
export const SYNCUP_TYPE_POSSIBLE_VALUES = 'possible-values-fields';
export const SYNCUP_TYPE_WORKSPACE_SETTINGS = 'workspace-settings';
export const SYNCUP_STATUS_SUCCESS = 'SUCCESS';
export const SYNCUP_STATUS_FAIL = 'FAIL';
export const SYNCUP_DATETIME_FIELD = 'timestamp';
export const SYNCUP_DIFF_LEFTOVER = 'syncup-diff-leftover';
export const SYNCUP_DEPENDENCY_CHECK_INTERVAL = 10;

export const ACTIVITY_STATUS_DRAFT = 'ACTIVITY_STATUS_DRAFT';
export const ACTIVITY_STATUS_UNVALIDATED = 'ACTIVITY_STATUS_UNVALIDATED';
export const ACTIVITY_STATUS_VALIDATED = 'ACTIVITY_STATUS_VALIDATED';

export const CURRENCY_HOUR = '00:00';

export const VERSION = '0.0.1';
export const AMP_COUNTRY_LOGO = './assets/ampCountryFlag.png';
export const ASSEST_DIRECTORY = './assets';
export const BASE_64_PNG_PREFIX = 'data:image/png;base64,';
// Holds the BASE64 representation of a a transparent image 1x1 in case we don't yet have the country flag
export const
  TRANSPARENT_FLAG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6zwAAAgcBApocMXEAAAAASUVORK5CYII=';

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
