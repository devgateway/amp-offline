export const SERVER_URL = '__SERVER_URL__';
export const BASE_REST_URL = '/rest';
export const PROTOCOL = '__SERVER_PROTOCOL__';
export const BASE_PORT = '__SERVER_PORT__';
export const CONNECTION_TIMEOUT = 15000;
export const MAX_RETRY_ATEMPTS = 5;
export const ERRORS_TO_RETRY = ['ESOCKETTIMEDOUT', 'ETIMEDOUT'];

export const WORKSPACE_URL = '/workspace';
export const LOGIN_URL = '/';
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
export const COLLECTION_SYNCUP_LOG = 'syncup_log';
export const COLLECTION_LANGS = 'languages';
export const COLLECTION_WS_SETTINGS = 'workspace-settings';

export const DB_FILE_PREFIX = './database/';
export const DB_FILE_EXTENSION = '.db';
// TODO: Find a better way to store the key.
export const AKEY = 'key';
export const DB_COMMON_DATASTORE_OPTIONS = { autoload: false, corruptAlertThreshold: 0 };
export const DB_AUTOCOMPACT_INTERVAL_MILISECONDS = 60000;

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
export const SYNCUP_TYPE_WORKSPACES = 'workspaces';
export const SYNCUP_TYPE_GS = 'global-settings';
export const SYNCUP_TYPE_WORKSPACE_MEMBERS = 'workspace-members';
export const SYNCUP_TYPE_ACTIVITIES = 'activities';
export const SYNCUP_TYPE_FIELDS = 'fields';
export const SYNCUP_TYPE_POSSIBLE_VALUES = 'possible-values-fields';
export const SYNCUP_STATUS_SUCCESS = 'SUCCESS';
export const SYNCUP_STATUS_FAIL = 'FAIL';
export const SYNCUP_DATETIME_FIELD = 'timestamp';

export const ACTIVITY_STATUS_DRAFT = 'ACTIVITY_STATUS_DRAFT';
export const ACTIVITY_STATUS_UNVALIDATED = 'ACTIVITY_STATUS_UNVALIDATED';
export const ACTIVITY_STATUS_VALIDATED = 'ACTIVITY_STATUS_VALIDATED';

export const VERSION = '0.0.1';

// TODO this is a temporary limitation of the initial set of activities to export, AMPOFFLINE-273 or AMPOFFLINE-274
export const FIRST_ACTIVITIES_PULL_FROM_AMP_LIMIT = 50;
