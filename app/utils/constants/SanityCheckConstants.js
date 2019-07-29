export const VERSION = 'version';
export const TYPE = 'type';
export const DB_INCOMPATIBILITY_EXPECTED = 'db-incompatibility-expected';
export const DB_INCOMPATIBILITY_DETECTED = 'db-incompatibility-detected';
export const DB_VALIDATED_AT = 'db-validated-at';
export const DB_HEALED_BY = 'db-healed-by';
export const DB_HEALED_AT = 'db-healed-at';
export const DB_HEAL_STATUS = 'db-heal-status';
export const DB_HEAL_REASON = 'db-heal-reason';
export const IS_SANITY_DB_CORRUPTED = 'is-sanity-db-corrupted';

export const STATUS_DETAILS = 'status-details';
export const CORRUPTED_DB_NAMES = 'corrupted-db-names';
export const REMAINING_CORRUPTED_DB_NAMES = 'remaining-corrupted-db-names';
export const TOTAL_DB_FILES_FOUND = 'total-db-files-found';

export const TYPE_TRANSITION = 'transition';
export const TYPE_POST_UPGRADE = 'post-upgrade';
export const TYPE_STANDARD = 'standard';

export const HEALED_BY_APP = 'app';
export const HEALED_BY_USER = 'user';

export const STATUS_NOT_STARTED = 'NOT_STARTED';
export const STATUS_IN_PROGRESS = 'IN_PROGRESS';
export const STATUS_SUCCESS = 'SUCCESS';
export const STATUS_FAIL = 'FAIL';
export const STATUS_CANCELED = 'CANCELED';

export const REASON_TRANSITIONED = 'REASON_TRANSITIONED';
export const REASON_HEALED = 'REASON_HEALED';
export const REASON_DB_CORRUPTED = 'REASON_DB_CORRUPTED';
export const REASON_NO_DISK_SPACE = 'REASON_NO_DISK_SPACE';
export const TRANSITION_CAN_RETRY_ON_REASONS = [REASON_NO_DISK_SPACE];
