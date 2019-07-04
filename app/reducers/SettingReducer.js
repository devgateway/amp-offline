import {
  STATE_GO_TO_SETTINGS,
  STATE_LEAVE_UNSAVED_SETTINGS,
  STATE_LOAD_SETTINGS_FULFILLED,
  STATE_LOAD_SETTINGS_PENDING,
  STATE_LOAD_SETTINGS_REJECTED,
  STATE_SAVE_SETTINGS_FULFILLED,
  STATE_SAVE_SETTINGS_PENDING,
  STATE_SAVE_SETTINGS_REJECTED,
  STATE_SETTINGS_PAGE_LOADED,
  STATE_URL_CHANGE_DETECTED
} from '../actions/SettingAction';

const defaultState = {
  isSettingsLoading: false,
  isSettingsLoaded: false,
  isSettingsSaving: false,
  isSettingsSaved: false,
  isNavigateToSettings: false,
  settings: undefined,
  newUrls: undefined,
  allowNavigationTo: undefined,
  errorMessage: undefined
};

export default function settingReducer(state = defaultState, action: Object) {
  switch (action.type) {
    case STATE_LOAD_SETTINGS_PENDING:
      return { ...state,
        isSettingsLoading: true,
        isSettingsLoaded: false,
        settings: null,
        errorMessage: null,
        allowNavigationTo: null };
    case STATE_LOAD_SETTINGS_FULFILLED:
      return { ...state, isSettingsLoading: false, isSettingsLoaded: true, settings: action.payload };
    case STATE_LOAD_SETTINGS_REJECTED:
      return { ...state, isSettingsLoading: false, isSettingsLoaded: false, errorMessage: action.payload };
    case STATE_SAVE_SETTINGS_PENDING:
      return { ...state, isSettingsSaving: true, isSettingsSaved: false, errorMessage: undefined };
    case STATE_SAVE_SETTINGS_FULFILLED:
      return { ...state, isSettingsSaving: false, isSettingsSaved: true, newUrls: null };
    case STATE_SAVE_SETTINGS_REJECTED:
      return { ...state, isSettingsSaving: false, isSettingsSaved: false, errorMessage: action.payload };
    case STATE_URL_CHANGE_DETECTED:
      return { ...state, newUrls: action.actionData };
    case STATE_GO_TO_SETTINGS:
      return { ...state, isNavigateToSettings: true };
    case STATE_SETTINGS_PAGE_LOADED:
      return { ...state, isNavigateToSettings: false };
    case STATE_LEAVE_UNSAVED_SETTINGS:
      return { ...state, newUrls: null, isSettingsSaved: false, allowNavigationTo: action.actionData };
    default:
      return state;
  }
}
