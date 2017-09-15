import TranslationManager from '../modules/util/TranslationManager';
import LoggerManager from '../modules/util/LoggerManager';
import DateUtils from '../utils/DateUtils';
import PossibleValuesManager from '../modules/activity/PossibleValuesManager';
import { LANGUAGE_ENGLISH } from '../utils/Constants';

export const STATE_CHANGE_LANGUAGE = 'STATE_CHANGE_LANGUAGE';
export const STATE_LOADING_LIST_OF_LANGUAGES = 'STATE_LOADING_LIST_OF_LANGUAGES';
export const STATE_LIST_OF_LANGUAGES_LOADED = 'STATE_LIST_OF_LANGUAGES_LOADED';

export function initLanguage() {
  // TODO proper initial language selection should come in AMPOFFLINE-253
  return setLanguage(LANGUAGE_ENGLISH);
}

export function setLanguage(lang: string) {
  LoggerManager.log('setLanguage');
  DateUtils.setCurrentLang(lang);
  return (dispatch, ownProps) => new Promise((resolve, reject) => TranslationManager.changeLanguage(lang).then(() => {
    dispatch(language(lang));
    PossibleValuesManager.setLangState({ lang, defaultLang: ownProps().translationReducer.defaultLang });
    return resolve(lang);
  }).catch(reject));
}

export function loadAllLanguages(restart = false) {
  LoggerManager.log('loadAllLanguages');
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    return TranslationManager.getListOfLocalLanguages(restart).then((data) => {
      dispatch(languagesOk(data));
      return resolve(data);
    }).catch(reject);
  });
}

function language(lang: string) {
  LoggerManager.log('language');
  return {
    type: STATE_CHANGE_LANGUAGE,
    actionData: lang
  };
}

function sendingRequest() {
  LoggerManager.log('sendingRequest');
  return {
    type: STATE_LOADING_LIST_OF_LANGUAGES
  };
}

function languagesOk(data) {
  LoggerManager.log('languagesOk');
  return {
    type: STATE_LIST_OF_LANGUAGES_LOADED,
    actionData: data
  };
}
