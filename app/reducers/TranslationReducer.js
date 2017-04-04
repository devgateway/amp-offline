import {
  STATE_CHANGE_LANGUAGE,
  STATE_LOADING_LIST_OF_LANGUAGES,
  STATE_LIST_OF_LANGUAGES_LOADED
} from '../actions/TranslationAction';
import { LANGUAGE_ENGLISH } from '../utils/Constants';

const defaultState = {
  lang: LANGUAGE_ENGLISH,
  defaultLang: LANGUAGE_ENGLISH,
  languageList: [],
  loadingListOfLanguages: false
};

export default function translation(state: Object = defaultState, action: Object) {
  console.log('translation');
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
