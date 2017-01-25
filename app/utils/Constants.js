export const SERVER_URL = 'amp-timor-future-v3-0-tc9.ampsite.net';
export const BASE_REST_URL = '/rest';
export const PROTOCOL = 'http';
export const BASE_PORT = '80';
export const CONNECTION_TIMEOUT = '2500';
export const CONNECTIVITY_CHECK_INTERVAL = 300000000;//value in microseconds it means to 5 minutes
export const WORKSPACE_URL = '/workspace';
export const LOGIN_URL = '/';

export const COLLECTION_USERS = 'users';
export const COLLECTION_WORKPACES = 'workspaces';
export const COLLECTION_TEAMMEMBERS = 'teammembers';
export const COLLECTION_CLIENT_SETTINGS = 'client-settings';
export const COLLECTION_GLOBAL_SETTINGS = 'global-settings';

export const DB_FILE_PREFIX = './database/';
export const DB_FILE_EXTENSION = '.db';
// TODO: Find a better way to store the key.
export const AKEY = 'key';
export const DB_COMMON_DATASTORE_OPTIONS = { autoload: false, corruptAlertThreshold: 0 };
export const DB_AUTOCOMPACT_INTERVAL_MILISECONDS = 60000;

export const LANGUAGE_ENGLISH = 'en';
export const LANGUAGE_SPANISH = 'es';

export const HASH_ITERATIONS = 100;
export const DIGEST_ALGORITHM_SHA1 = 'SHA-1';
export const DIGEST_ALGORITHM_SHA256 = 'SHA-256';
