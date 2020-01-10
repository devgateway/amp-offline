import { Constants } from 'amp-ui';
import {
  STATE_CHANGE_LANGUAGE,
  STATE_LOADING_LIST_OF_LANGUAGES,
  STATE_LIST_OF_LANGUAGES_LOADED
} from '../actions/TranslationAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Translation reducer');

const defaultState = {
  lang: Constants.LANGUAGE_ENGLISH,
  defaultLang: Constants.LANGUAGE_ENGLISH,
  languageList: [],
  loadingListOfLanguages: false
};

export default function translationReducer(state: Object = defaultState, action: Object) {
  logger.debug('translation');
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
