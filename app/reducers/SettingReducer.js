import {
  STATE_LOAD_SETTINGS_FULFILLED,
  STATE_LOAD_SETTINGS_PENDING,
  STATE_LOAD_SETTINGS_REJECTED,
  STATE_SAVE_SETTINGS_FULFILLED,
  STATE_SAVE_SETTINGS_PENDING,
  STATE_SAVE_SETTINGS_REJECTED
} from '../actions/SettingAction';

const defaultState = {
  isSettingsLoading: false,
  isSettingsLoaded: false,
  isSettingsSaving: false,
  isSettingsSaved: false,
  settings: undefined,
  errorMessage: undefined
};

export default function settingReducer(state = defaultState, action: Object) {
  switch (action.type) {
    case STATE_LOAD_SETTINGS_PENDING:
      return { ...defaultState, isSettingsLoading: true };
    case STATE_LOAD_SETTINGS_FULFILLED:
      return { ...state, isSettingsLoading: false, isSettingsLoaded: true, settings: action.payload };
    case STATE_LOAD_SETTINGS_REJECTED:
      return { ...state, isSettingsLoading: false, isSettingsLoaded: false, errorMessage: action.payload };
    case STATE_SAVE_SETTINGS_PENDING:
      return { ...state, isSettingsSaving: true, isSettingsSaved: false, errorMessage: undefined };
    case STATE_SAVE_SETTINGS_FULFILLED:
      return { ...state, isSettingsSaving: false, isSettingsSaved: true };
    case STATE_SAVE_SETTINGS_REJECTED:
      return { ...state, isSettingsSaving: false, isSettingsSaved: false, errorMessage: action.payload };
    default:
      return state;
  }
}
