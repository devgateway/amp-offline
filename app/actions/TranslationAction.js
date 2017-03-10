// @flow
import TranslationManager from '../modules/util/TranslationManager';

export const STATE_CHANGE_LANGUAGE = 'STATE_CHANGE_LANGUAGE';
export const STATE_LOADING_LIST_OF_LANGUAGES = 'STATE_LOADING_LIST_OF_LANGUAGES';
export const STATE_LIST_OF_LANGUAGES_LOADED = 'STATE_LIST_OF_LANGUAGES_LOADED';

export function setLanguage(lang: string) {
  console.log('setLanguage');
  return dispatch => new Promise((resolve, reject) => {
    return TranslationManager.changeLanguage(lang).then(() => {
      dispatch(language(lang));
      resolve(lang);
    });
  });
}

export function loadAllLanguages(restart = false) {
  console.log('loadAllLanguages');
  return dispatch => new Promise((resolve, reject) => {
    dispatch(sendingRequest());
    return TranslationManager.getListOfLocalLanguages(restart).then((data) => {
      dispatch(languagesOk(data));
      resolve(data);
    }).catch(reject);
  });
}

function language(lang: string) {
  console.log('language');
  return {
    type: STATE_CHANGE_LANGUAGE,
    actionData: lang
  };
}

function sendingRequest() {
  console.log('sendingRequest');
  return {
    type: STATE_LOADING_LIST_OF_LANGUAGES
  };
}

function languagesOk(data) {
  console.log('languagesOk');
  return {
    type: STATE_LIST_OF_LANGUAGES_LOADED,
    actionData: data
  };
}
