import {expect} from 'chai';
import translationReducer from '../../app/reducers/TranslationReducer';
import * as constants from '../../app/actions/TranslationAction';
import {TEST_FAKE_STATE, TEST_LANG_EN, TEST_LANG_SP} from '../Constants'

const defaultState = {
  lang: TEST_LANG_EN
};

describe('@@ TranslationReducer @@', () => {
  it('func translationReducer - Should return default state with empty params.', () => {
    expect(translationReducer(undefined, {})).to.deep.equal(defaultState);
  });

  it('func translationReducer - Should return default state with incorrect type', () => {
    expect(translationReducer(undefined, {type: TEST_FAKE_STATE})).to.deep.equal(defaultState);
  });

  it('func translationReducer - Test type: STATE_CHANGE_LANGUAGE without change language', () => {
    expect(translationReducer({}, {
      type: constants.STATE_CHANGE_LANGUAGE,
      actionData: TEST_LANG_EN
    })).to.deep.equal({lang: TEST_LANG_EN});
  });

  it('func translationReducer - Test type: STATE_CHANGE_LANGUAGE and change language', () => {
    expect(translationReducer({}, {
      type: constants.STATE_CHANGE_LANGUAGE,
      actionData: TEST_LANG_SP
    })).to.deep.equal({lang: TEST_LANG_SP});
  });
});
