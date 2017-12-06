import {
  ACTIVITY_LOAD_FULFILLED,
  ACTIVITY_LOAD_PENDING,
  ACTIVITY_LOAD_REJECTED,
  ACTIVITY_SAVE_FULFILLED,
  ACTIVITY_SAVE_PENDING,
  ACTIVITY_SAVE_REJECTED,
  ACTIVITY_UNLOADED,
  ACTIVITY_VALIDATED,
  ACTIVITY_FIELD_VALIDATED,
  ACTIVITY_LOADED_FOR_AF,
  ACTIVITY_UPDATE_GLOBAL_STATE
} from '../actions/ActivityAction';
import { STATE_CHANGE_LANGUAGE } from '../actions/TranslationAction';
import Logger from '../modules/util/LoggerManager';
import ActivityFieldsManager from '../modules/activity/ActivityFieldsManager';

const logger = new Logger('Activity reducer');

const defaultState = {
  isActivityLoading: false,
  isActivityLoaded: false,
  isActivityLoadedForAf: false,
  isActivitySaving: false,
  isActivitySaved: false,
  activity: undefined,
  savedActivity: undefined,
  activityWorkspace: undefined,
  activityFieldsManager: undefined,
  activityFundingTotals: undefined,
  validationResult: undefined,
  fieldValidationResult: undefined,
  currentWorkspaceSettings: undefined,
  currencyRatesManager: undefined,
  otherProjectTitles: undefined,
  errorMessage: undefined,
  globalState: {}
};

const activityReducer = (state = defaultState, action: Object) => {
  logger.debug('activityReducer');
  switch (action.type) {
    case ACTIVITY_UNLOADED:
      return { ...defaultState };
    case ACTIVITY_LOAD_PENDING:
      return { ...defaultState, isActivityLoading: true };
    case ACTIVITY_LOAD_FULFILLED:
      return {
        ...state,
        isActivityLoading: false,
        isActivityLoaded: true,
        activity: action.payload.activity,
        activityWorkspace: action.payload.activityWorkspace,
        activityFieldsManager: action.payload.activityFieldsManager,
        activityFundingTotals: action.payload.activityFundingTotals,
        currentWorkspaceSettings: action.payload.currentWorkspaceSettings,
        currencyRatesManager: action.payload.currencyRatesManager,
        otherProjectTitles: action.payload.otherProjectTitles
      };
    case ACTIVITY_LOAD_REJECTED:
      return { ...defaultState, errorMessage: action.payload };
    case ACTIVITY_LOADED_FOR_AF:
      return { ...state, isActivityLoadedForAf: true };
    case STATE_CHANGE_LANGUAGE: {
      let activityFieldsManager = state.activityFieldsManager;
      if (activityFieldsManager) {
        // we no longer will use the previous activityFieldsManager, thus shallow clone is acceptable
        activityFieldsManager = ActivityFieldsManager.clone(activityFieldsManager);
        activityFieldsManager.currentLanguageCode = action.actionData;
      }
      return { ...state, activityFieldsManager };
    }
    case ACTIVITY_SAVE_PENDING:
      return { ...state, isActivitySaving: true, isActivitySaved: false, isActivityLoaded: false };
    case ACTIVITY_SAVE_FULFILLED:
      return {
        ...state,
        isActivitySaving: false,
        isActivitySaved: true,
        savedActivity: action.payload,
        isActivityLoaded: true
      };
    case ACTIVITY_SAVE_REJECTED:
      return { ...state, isActivitySaving: false, isActivitySaved: false };
    case ACTIVITY_VALIDATED:
      return { ...state, validationResult: action.payload };
    case ACTIVITY_FIELD_VALIDATED:
      return { ...state, fieldValidationResult: action.payload };
    case ACTIVITY_UPDATE_GLOBAL_STATE: {
      const newState = { ...state };
      newState.globalState = { ...state.globalState, ...action.actionData };
      return newState;
    }
    default:
      return state;
  }
};

export default activityReducer;
