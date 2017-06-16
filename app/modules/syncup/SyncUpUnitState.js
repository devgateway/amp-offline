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

/** Sync up pending to commence states */
export const STATES_PENDING = [PENDING, DEPENDENCY_PENDING];
/** Fully successful sync up states */
export const STATES_SUCCESS = [SUCCESS, NO_CHANGES];
/** Fully or partially successful sync up states */
export const STATES_PARTIAL_SUCCESS = [SUCCESS, PARTIAL, NO_CHANGES];
/** Sync up ended states, no matter successfully or not */
export const STATES_FINISH = [SUCCESS, PARTIAL, FAIL, DEPENDENCY_FAIL, NO_CHANGES];
