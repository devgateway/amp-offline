// @flow
export const STATE_CHANGE_LANGUAGE = 'STATE_CHANGE_LANGUAGE';

export function language(lang) {
  return {
    type: STATE_CHANGE_LANGUAGE,
    actionData: lang
  };
}

export function setLanguage(lang) {
  console.log('changeLanguage');
  return (dispatch) => {
    dispatch(language(lang));
  }
}
