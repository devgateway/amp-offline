/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setLanguage, STATE_CHANGE_LANGUAGE } from '../../app/actions/TranslationAction';
import * as constants from '../Constants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('@@ TranslationAction @@', () => {
  it('should set language to english -> func setLanguage', () => {
    const state = [{ translation: { lang: '' } }];
    const store = mockStore(state);

    return store.dispatch(setLanguage(constants.TEST_LANG_EN))
      .then(() => (
        expect(store.getActions()).to.be.deep.equal([{
          type: STATE_CHANGE_LANGUAGE,
          actionData: constants.TEST_LANG_EN
        }])
      ));
  });
});
