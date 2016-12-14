// @flow
import {STATE_CHANGE_LANGUAGE} from '../actions/TranslationAction';
import {LANGUAGE_ENGLISH, LANGUAGE_SPANISH} from '../utils/Constants';

const defaultState = {
  lang: LANGUAGE_ENGLISH
};

export default function translationReducer(state: something = defaultState, action: Object) {
  console.log('translationReducer');
  switch (action.type) {
    case STATE_CHANGE_LANGUAGE:
      return Object.assign({}, state, {
        lang: action.actionData
      });
    default:
      console.log('default state: ' + action.type);
      return state;
  }
}
