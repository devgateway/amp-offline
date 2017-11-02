import {
  STATE_SETUP_OPTIONS_FULFILLED,
  STATE_SETUP_OPTIONS_PENDING,
  STATE_SETUP_OPTIONS_REJECTED,
  STATE_SETUP_STATUS_FULFILLED,
  STATE_SETUP_STATUS_PENDING,
  STATE_SETUP_STATUS_REJECTED,
  STATE_URL_TEST_RESULT_FULFILLED,
  STATE_URL_TEST_RESULT_PENDING,
  STATE_URL_TEST_RESULT_REJECTED
} from '../actions/SetupAction';

const defaultState = {
  isSetupComplete: false,
  errorMessage: null,
  isSetupOptionsLoading: false,
  isSetupOptionsLoaded: false,
  isSetupOptionsLoadFailed: false,
  setupOptions: undefined,
  isUrlTestInProgress: false,
  urlTestResult: undefined
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
    case STATE_URL_TEST_RESULT_PENDING:
      return {
        ...state,
        isUrlTestInProgress: true,
        urlTestResult: undefined
      };
    case STATE_URL_TEST_RESULT_FULFILLED:
      return {
        ...state,
        isUrlTestInProgress: false,
        urlTestResult: action.payload
      };
    case STATE_URL_TEST_RESULT_REJECTED:
      return {
        ...state,
        isUrlTestInProgress: false,
        urlTestResult: { errorMessage: action.payload }
      };
    default:
      return state;
  }
}
