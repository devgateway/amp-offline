import { expect } from 'chai';
import { describe, it } from 'mocha';
import translationReducer from '../../app/reducers/TranslationReducer';
import * as constants from '../../app/actions/TranslationAction';
import { TEST_FAKE_STATE, TEST_LANG_EN, TEST_LANG_SP } from '../Constants';

const defaultState = {
  lang: TEST_LANG_EN,
  defaultLang: TEST_LANG_EN,
  languageList: [],
  loadingListOfLanguages: false
};

describe('@@ TranslationReducer @@', () => {
  it('should return default state with empty params.', () =>
    expect(translationReducer(undefined, {})).to.deep.equal(defaultState)
  );

  it('should return default state with incorrect type', () => {
    expect(translationReducer(undefined, { type: TEST_FAKE_STATE })).to.deep.equal(defaultState);
  });

  it('should not change language', () =>
    expect(translationReducer({}, {
      type: constants.STATE_CHANGE_LANGUAGE,
      actionData: TEST_LANG_EN
    })).to.deep.equal({ lang: TEST_LANG_EN })
  );

  it('should change language', () =>
    expect(translationReducer({}, {
      type: constants.STATE_CHANGE_LANGUAGE,
      actionData: TEST_LANG_SP
    })).to.deep.equal({ lang: TEST_LANG_SP })
  );
});
