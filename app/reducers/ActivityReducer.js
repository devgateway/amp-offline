import {
  ACTIVITY_LOAD_PENDING,
  ACTIVITY_LOAD_FULFILLED,
  ACTIVITY_LOAD_REJECTED
} from '../actions/ActivityAction';
import { STATE_CHANGE_LANGUAGE } from '../actions/TranslationAction';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  isActivityLoading: false,
  isActivityLoaded: false,
  activity: undefined,
  activityWorkspace: undefined,
  activityFieldsManager: undefined,
  activityFundingTotals: undefined,
  errorMessage: undefined
};

const activityReducer = (state = defaultState, action: Object) => {
  LoggerManager.log('activityPreview');
  switch (action.type) {
    case ACTIVITY_LOAD_PENDING:
      return { ...defaultState, isActivityPreviewLoading: true };
    case ACTIVITY_LOAD_FULFILLED:
      return { ...state,
        isActivityPreviewLoading: false,
        isActivityPreviewLoaded: true,
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
    default:
      return state;
  }
};

export default activityReducer;
