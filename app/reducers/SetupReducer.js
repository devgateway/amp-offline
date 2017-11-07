import {
  STATE_SETUP_DEFAULTS_FULFILLED,
  STATE_SETUP_DEFAULTS_PENDING,
  STATE_SETUP_DEFAULTS_REJECTED,
  STATE_SETUP_OPTIONS_FULFILLED,
  STATE_SETUP_OPTIONS_PENDING,
  STATE_SETUP_OPTIONS_REJECTED,
  STATE_SETUP_STATUS_FULFILLED,
  STATE_SETUP_STATUS_PENDING,
  STATE_SETUP_STATUS_REJECTED
} from '../actions/SetupAction';

const defaultState = {
  isSetupComplete: false,
  isDefaultLoaded: false,
  isDefaultLoading: false,
  errorMessage: null,
  isSetupOptionsLoading: false,
  isSetupOptionsLoaded: false,
  isSetupOptionsLoadFailed: false,
  setupOptions: undefined
};

/**
 * Initial setup store state
 * @param state
 * @param action
 * @return {*}
 */
export default function setupReducer(state = defaultState, action: Object) {
  switch (action.type) {
    case STATE_SETUP_STATUS_PENDING:
    case STATE_SETUP_STATUS_REJECTED:
      return { ...state, isSetupComplete: false, errorMessage: action.payload };
    case STATE_SETUP_STATUS_FULFILLED:
      return { ...state, isSetupComplete: action.payload };
    case STATE_SETUP_OPTIONS_PENDING:
      return {
        ...state,
        isSetupOptionsLoading: true,
        errorMessage: null,
        isSetupOptionsLoaded: false,
        isSetupOptionsLoadFailed: false,
        setupOptions: undefined
      };
    case STATE_SETUP_OPTIONS_FULFILLED:
      return {
        ...state,
        isSetupOptionsLoaded: true,
        isSetupOptionsLoading: false,
        setupOptions: action.payload
      };
    case STATE_SETUP_OPTIONS_REJECTED:
      return {
        ...state,
        isSetupOptionsLoadFailed: true,
        isSetupOptionsLoading: false,
        errorMessage: action.payload
      };
    case STATE_SETUP_DEFAULTS_PENDING:
      return { ...state, isDefaultLoading: true, isDefaultLoaded: false };
    case STATE_SETUP_DEFAULTS_FULFILLED:
      return { ...state, isDefaultLoading: false, isDefaultLoaded: true };
    case STATE_SETUP_DEFAULTS_REJECTED:
      return { ...state, isDefaultLoading: false, isDefaultLoaded: false, errorMessage: action.payload };
    default:
      return state;
  }
}
