import {
  STATE_FM_FULFILLED,
  STATE_FM_PENDING,
  STATE_FM_REJECTED,
  STATE_GS_DATE_LOADED,
  STATE_GS_FULFILLED,
  STATE_GS_NUMBERS_LOADED,
  STATE_GS_PENDING,
  STATE_GS_REJECTED,
  STATE_PARAMETERS_FAILED,
  STATE_PARAMETERS_LOADED,
  STATE_PARAMETERS_LOADING
} from '../actions/StartUpAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  connectionInformation: undefined,
  loadingInProgress: false,
  isGSLoading: false,
  isGSLoaded: false,
  gsLoadError: undefined,
  globalSettings: undefined,
  fmTree: undefined,
  isFMTreeLoading: false,
  isFMTreeLoaded: false,
  fmTreeError: undefined
};

export default function startUpReducer(state = defaultState, action: Object) {
  LoggerManager.log('startUpReducer');

  switch (action.type) {
    case STATE_PARAMETERS_LOADED:
      return Object.assign({}, state, {
        connectionInformation: action.actionData.connectionInformation,
        loadingInProgress: false
      });
    case STATE_PARAMETERS_LOADING:
      return Object.assign({}, state, { loadingInProgress: true });
    case STATE_PARAMETERS_FAILED:
      return Object.assign({}, state, { error: action.error, loadingInProgress: false });
    case STATE_GS_NUMBERS_LOADED:
      return Object.assign({}, state, { error: action.error });
    case STATE_GS_DATE_LOADED:
      return Object.assign({}, state, { error: action.error });
    case STATE_GS_PENDING:
      return Object.assign({}, state, {
        globalSettings: null,
        gsLoadError: null,
        isGSLoading: true,
        isGSLoaded: false
      });
    case STATE_GS_FULFILLED:
      return Object.assign({}, state, { globalSettings: action.payload, isGSLoading: false, isGSLoaded: true });
    case STATE_GS_REJECTED:
      return Object.assign({}, state, { gsLoadError: action.payload, isGSLoading: false, isGSLoaded: false });
    case STATE_FM_PENDING:
      return Object.assign({}, state, {
        fmTree: null,
        fmTreeError: null,
        isFMTreeLoading: true,
        isFMTreeLoaded: false
      });
    case STATE_FM_FULFILLED:
      return Object.assign({}, state, {
        fmTree: action.payload ? action.payload.fmTree : undefined,
        isFMTreeLoading: false,
        isFMTreeLoaded: true
      });
    case STATE_FM_REJECTED:
      return Object.assign({}, state, { fmTreeError: action.payload, isFMTreeLoading: false, isFMTreeLoaded: false });
    default:
      return state;
  }
}
