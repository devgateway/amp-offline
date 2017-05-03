import {
  STATE_CHANGE_LANGUAGE,
  STATE_LOADING_LIST_OF_LANGUAGES,
  STATE_LIST_OF_LANGUAGES_LOADED
} from '../actions/TranslationAction';
import { LANGUAGE_ENGLISH } from '../utils/Constants';
import LoggerManager from '../modules/util/LoggerManager';

const defaultState = {
  lang: LANGUAGE_ENGLISH,
  defaultLang: LANGUAGE_ENGLISH,
  languageList: [],
  loadingListOfLanguages: false
};

export default function translationReducer(state: Object = defaultState, action: Object) {
  LoggerManager.log('translation');
  switch (action.type) {
    case STATE_CHANGE_LANGUAGE:
      return Object.assign({}, state, {
        lang: action.actionData
      });
    case STATE_LOADING_LIST_OF_LANGUAGES:
      return Object.assign({}, state, {
        loadingListOfLanguages: true
      });
    case STATE_LIST_OF_LANGUAGES_LOADED:
      return Object.assign({}, state, {
        languageList: action.actionData,
        loadingListOfLanguages: false
      });
    default:
      return state;
  }
}
