import TranslationManager from '../modules/util/TranslationManager';
import Logger from '../modules/util/LoggerManager';
import DateUtils from '../utils/DateUtils';
import PossibleValuesManager from '../modules/field/PossibleValuesManager';
import { LANGUAGE_ENGLISH } from '../utils/Constants';
import store from '../index';

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
  return (dispatch, ownProps) => (
    _changeLanguage(lang, ownProps().translationReducer.defaultLang).then(() => dispatch(language(lang)))
  );
}

export function loadAllLanguages(restart = false) {
  logger.log('loadAllLanguages');
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    const currentLang = store.getState().translationReducer.lang;
    const defaultLang = store.getState().translationReducer.defaultLang;
    return TranslationManager.getListOfLocalLanguages(restart).then((data) => {
      dispatch(languagesOk(data));
      if (restart) {
        return _changeLanguage(currentLang, defaultLang).then(() => (resolve(data)));
      } else {
        return resolve(data);
      }
    }).catch(reject);
  });
}

function _changeLanguage(lang: string, defaultLang: string) {
  logger.log('_changeLanguage');
  DateUtils.setCurrentLang(lang);
  return new Promise((resolve, reject) => TranslationManager.changeLanguage(lang).then(() => {
    PossibleValuesManager.setLangState({ lang, defaultLang });
    return resolve(lang);
  }).catch(reject));
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
