// @flow
import {STATE_CHANGE_LANGUAGE} from '../actions/TranslationAction';

const defaultState = {
  lang: 'en'
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
