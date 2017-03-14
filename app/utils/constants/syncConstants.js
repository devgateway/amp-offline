/**
 * Created by JulianEduardo on 14/12/2016.
 */
export const SYNC_STATUS_PENDING = 'pending'; // the sync has been requested
export const SYNC_STATUS_IN_PROGRESS = 'inProgress'; // the sync is in progress
export const SYNC_STATUS_FAILED = 'failed'; // the sync has failed, we are going to retry
export const SYNC_STATUS_CANCELLED = 'cancelled'; // the sync has failed x times and has been cancelled
export const SYNC_STATUS_COMPLETED = 'completed'; // all subtasks have been synced
