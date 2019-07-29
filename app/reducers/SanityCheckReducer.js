import {
  STATE_DB_HEAL_CANCEL,
  STATE_DB_HEAL_COMPLETE, STATE_DB_HEAL_FAILURE_MSG_VIEWED,
  STATE_DB_HEAL_IN_PROGRESS,
  STATE_DB_HEAL_PROCEED,
  STATE_DB_RESTART_SANITY_CHECK,
  STATE_SANITY_CHECK_FULFILLED,
  STATE_SANITY_CHECK_PENDING,
  STATE_SANITY_CHECK_REJECTED
} from '../actions/SanityCheckAction';

const defaultState = {
  isSanityCheckPending: undefined,
  isSanityCheckComplete: undefined,
  isSanityCheckRestart: undefined,
  isPerformDBCleanup: undefined,
  isCancelDBCleanup: undefined,
  isDBCleanupInProgress: undefined,
  isDBCleanupCompleted: undefined,
  isDBFailureMsgViewed: undefined,
  databaseSanityStatus: undefined,
  errorMessage: undefined,
};

/**
 * Initial setup store state
 * @param state
 * @param action
 * @return {*}
 */
export default function sanityCheckReducer(state = defaultState, action: Object) {
  switch (action.type) {
    case STATE_SANITY_CHECK_FULFILLED:
      return {
        ...state,
        isSanityCheckPending: false,
        isSanityCheckComplete: true,
        databaseSanityStatus: action.payload,
        errorMessage: null
      };
    case STATE_SANITY_CHECK_PENDING:
      return { ...defaultState };
    case STATE_SANITY_CHECK_REJECTED:
      return {
        ...state,
        isSanityCheckPending: false,
        isSanityCheckComplete: true,
        databaseSanityStatus: null,
        errorMessage: action.payload
      };
    case STATE_DB_RESTART_SANITY_CHECK:
      return { ...state, isSanityCheckRestart: true };
    case STATE_DB_HEAL_PROCEED:
      return {
        ...state,
        isPerformDBCleanup: true,
        isCancelDBCleanup: false,
        isDBCleanupInProgress: false,
        isDBCleanupCompleted: false
      };
    case STATE_DB_HEAL_IN_PROGRESS:
      return { ...state, isDBCleanupInProgress: true };
    case STATE_DB_HEAL_COMPLETE:
      return {
        ...state,
        isPerformDBCleanup: false,
        isDBCleanupInProgress: false,
        isDBCleanupCompleted: true
      };
    case STATE_DB_HEAL_CANCEL:
      return {
        ...state,
        isPerformDBCleanup: false,
        isCancelDBCleanup: true,
        isDBCleanupInProgress: false,
        isDBCleanupCompleted: false
      };
    case STATE_DB_HEAL_FAILURE_MSG_VIEWED:
      return {
        ...state,
        isDBFailureMsgViewed: true,
      };
    default:
      return state;
  }
}
