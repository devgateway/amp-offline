import TranslationManager from '../modules/util/TranslationManager';
import Logger from '../modules/util/LoggerManager';
import DateUtils from '../utils/DateUtils';
import PossibleValuesManager from '../modules/activity/PossibleValuesManager';
import { LANGUAGE_ENGLISH } from '../utils/Constants';

export const STATE_CHANGE_LANGUAGE = 'STATE_CHANGE_LANGUAGE';
export const STATE_LOADING_LIST_OF_LANGUAGES = 'STATE_LOADING_LIST_OF_LANGUAGES';
export const STATE_LIST_OF_LANGUAGES_LOADED = 'STATE_LIST_OF_LANGUAGES_LOADED';

const logger = new Logger('Translation action');

export function initLanguage() {
  // TODO proper initial language selection should come in AMPOFFLINE-253
  return setLanguage(LANGUAGE_ENGLISH);
}

export function setLanguage(lang: string) {
  logger.log('setLanguage');
  DateUtils.setCurrentLang(lang);
  return (dispatch, ownProps) => new Promise((resolve, reject) => TranslationManager.changeLanguage(lang).then(() => {
    PossibleValuesManager.setLangState({ lang, defaultLang: ownProps().translationReducer.defaultLang });
    dispatch(language(lang));
    return resolve(lang);
  }).catch(reject));
}

export function loadAllLanguages(restart = false) {
  logger.log('loadAllLanguages');
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    return TranslationManager.getListOfLocalLanguages(restart).then((data) => {
      dispatch(languagesOk(data));
      return resolve(data);
    }).catch(reject);
  });
}

function language(lang: string) {
  logger.log('language');
  return {
    type: STATE_CHANGE_LANGUAGE,
    actionData: lang
  };
}

function sendingRequest() {
  logger.log('sendingRequest');
  return {
    type: STATE_LOADING_LIST_OF_LANGUAGES
  };
}

function languagesOk(data) {
  logger.log('languagesOk');
  return {
    type: STATE_LIST_OF_LANGUAGES_LOADED,
    actionData: data
  };
}
