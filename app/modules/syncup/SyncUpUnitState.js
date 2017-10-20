import {
  SYNCUP_STATUS_CANCELED,
  SYNCUP_STATUS_FAIL,
  SYNCUP_STATUS_PARTIAL,
  SYNCUP_STATUS_SUCCESS
} from '../../utils/Constants';

/** Unit syncup is pending. Changes are detected and there is no dependency or dependency is fulfilled. */
export const PENDING = 'PENDING';
/** Unit syncup is pending. Changes are detected and there is some dependency that has to be fulfilled. */
export const DEPENDENCY_PENDING = 'DEPENDENCY_PENDING';
/** Unit syncup is in progress. */
export const IN_PROGRESS = 'IN_PROGRESS';
/** Unit syncup is completed successfully. */
export const SUCCESS = 'SUCCESS';
/** Unit syncup is completed partially successfully. Usually a leftover remained for the next sync up. */
export const PARTIAL = 'PARTIAL';
/** Unit syncup execution failed. */
export const FAIL = 'FAIL';
/** Unit syncup execution could not start since dependency did not fulfilled as required. */
export const DEPENDENCY_FAIL = 'DEPENDENCY_FAIL';
/** Unit syncup execution did not start. No changes detected. */
export const NO_CHANGES = 'NO_CHANGES';
/** Unit syncup execution was aborted. The sync up could not be completed. */
export const ABORTED = 'ABORTED';

/** Sync up pending to commence states */
export const STATES_PENDING = [PENDING, DEPENDENCY_PENDING];
/** Fully successful sync up states */
export const STATES_SUCCESS = [SUCCESS, NO_CHANGES];
/** Fully or partially successful sync up states */
export const STATES_PARTIAL_SUCCESS = [SUCCESS, PARTIAL, NO_CHANGES];
/** Sync up ended states, no matter successfully or not */
export const STATES_FINISH = [SUCCESS, PARTIAL, FAIL, DEPENDENCY_FAIL, NO_CHANGES, ABORTED];
/** Sync up was prevented to start */
export const STATES_PREVENTED = [DEPENDENCY_FAIL, ABORTED];

/** Mapping from state to status */
export const STATE_TO_STATUS = {};
STATE_TO_STATUS[SUCCESS] = SYNCUP_STATUS_SUCCESS;
STATE_TO_STATUS[NO_CHANGES] = SYNCUP_STATUS_SUCCESS;
STATE_TO_STATUS[PARTIAL] = SYNCUP_STATUS_PARTIAL;
STATE_TO_STATUS[FAIL] = SYNCUP_STATUS_FAIL;
STATE_TO_STATUS[DEPENDENCY_FAIL] = SYNCUP_STATUS_FAIL;
STATE_TO_STATUS[ABORTED] = SYNCUP_STATUS_CANCELED;
