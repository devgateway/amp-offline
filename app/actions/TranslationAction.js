// @flow
export const STATE_CHANGE_LANGUAGE = 'STATE_CHANGE_LANGUAGE';

export function language(lang:string) {
  return {
    type: STATE_CHANGE_LANGUAGE,
    actionData: lang
  };
}

export function setLanguage(lang:string) {
  console.log('changeLanguage');
  return (dispatch:Object) => {
    dispatch(language(lang));
  };
}
