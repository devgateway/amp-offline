import {
  ACTIVITY_LOAD_PENDING,
  ACTIVITY_LOAD_FULFILLED,
  ACTIVITY_LOAD_ERROR
} from '../actions/ActivityAction';
import { STATE_CHANGE_LANGUAGE } from '../actions/TranslationAction';


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
  console.log('activityPreview');
  switch (action.type) {
    case ACTIVITY_LOAD_PENDING:
      return { ...defaultState, isActivityPreviewLoading: true };
    case ACTIVITY_LOAD_FULFILLED:
      return { ...state,
        isActivityPreviewLoading: false,
        isActivityPreviewLoaded: true,
        activity: action.actionData.activity,
        activityWorkspace: action.actionData.activityWorkspace,
        activityFieldsManager: action.actionData.activityFieldsManager,
        activityFundingTotals: action.actionData.activityFundingTotals
      };
    case ACTIVITY_LOAD_ERROR:
      return { ...defaultState, errorMessage: action.actionData.errorMessage };
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
