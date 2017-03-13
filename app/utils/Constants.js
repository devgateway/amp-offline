export const SERVER_URL = '__SERVER_URL__';
export const BASE_REST_URL = '/rest';
export const PROTOCOL = '__SERVER_PROTOCOL__';
export const BASE_PORT = '__SERVER_PORT__';
export const CONNECTION_TIMEOUT = 5000;
export const MAX_RETRY_ATEMPTS = 5;
export const ERRORS_TO_RETRY = ['ESOCKETTIMEDOUT', 'ETIMEDOUT'];

export const WORKSPACE_URL = '/workspace';
export const LOGIN_URL = '/';
export const ACTIVITY_PREVIEW_URL = '/activityPreview';
export const ACTIVITY_EDIT_URL = '/editActivity';

export const COLLECTION_USERS = 'users';
export const COLLECTION_WORKPACES = 'workspaces';
export const COLLECTION_TEAMMEMBERS = 'teammembers';
export const COLLECTION_CLIENT_SETTINGS = 'client-settings';
export const COLLECTION_GLOBAL_SETTINGS = 'global-settings';
export const COLLECTION_ACTIVITIES = 'activities';
export const COLLECTION_FIELDS = 'fields';
export const COLLECTION_POSSIBLE_VALUES = 'possible-values';
export const COLLECTION_SYNC_LOG = 'sync_log';
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

export const HASH_ITERATIONS = 100;
export const DIGEST_ALGORITHM_SHA1 = 'SHA-1';
export const DIGEST_ALGORITHM_SHA256 = 'SHA-256';

export const ACTIVITY_EDIT = 'ACTIVITY_EDIT';
export const ACTIVITY_VIEW = 'ACTIVITY_VIEW';
