import {
  ACTIVITY_LOAD_PENDING,
  ACTIVITY_LOAD_FULFILLED,
  ACTIVITY_LOAD_REJECTED,
  ACTIVITY_SAVE_PENDING,
  ACTIVITY_SAVE_FULFILLED,
  ACTIVITY_SAVE_REJECTED,
  ACTIVITY_UNLOADED
} from '../actions/ActivityAction';
import { STATE_CHANGE_LANGUAGE } from '../actions/TranslationAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  isActivityLoading: false,
  isActivityLoaded: false,
  isActivitySaving: false,
  isActivitySaved: false,
  activity: undefined,
  savedActivity: undefined,
  activityWorkspace: undefined,
  activityFieldsManager: undefined,
  activityFundingTotals: undefined,
  errorMessage: undefined
};

const activityReducer = (state = defaultState, action: Object) => {
  LoggerManager.log('activityPreview');
  switch (action.type) {
    case ACTIVITY_UNLOADED:
      return { ...defaultState };
    case ACTIVITY_LOAD_PENDING:
      return { ...defaultState, isActivityLoading: true };
    case ACTIVITY_LOAD_FULFILLED:
      return { ...state,
        isActivityLoading: false,
        isActivityLoaded: true,
        activity: action.payload.activity,
        activityWorkspace: action.payload.activityWorkspace,
        activityFieldsManager: action.payload.activityFieldsManager,
        activityFundingTotals: action.payload.activityFundingTotals
      };
    case ACTIVITY_LOAD_REJECTED:
      return { ...defaultState, errorMessage: action.payload };
    case STATE_CHANGE_LANGUAGE:
      if (state.activityFieldsManager) {
        // TODO to be handled otherwise to avoid changing state here
        state.activityFieldsManager.currentLanguageCode = action.actionData;
      }
      return { ...state };
    case ACTIVITY_SAVE_PENDING:
      return { ...state, isActivitySaving: true, isActivitySaved: false };
    case ACTIVITY_SAVE_FULFILLED:
      return { ...state, isActivitySaving: false, isActivitySaved: true, savedActivity: action.payload };
    case ACTIVITY_SAVE_REJECTED:
      return { ...state, isActivitySaving: false, isActivitySaved: false };
    default:
      return state;
  }
};

export default activityReducer;
