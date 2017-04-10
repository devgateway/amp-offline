/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { spy } from 'sinon';
import { setLanguage, STATE_CHANGE_LANGUAGE } from '../../app/actions/TranslationAction';
import * as constants from '../Constants';

describe('@@ TranslationAction @@', (/* done */) => {
  it('should set language to english -> func setLanguage', () => {
    const fn = setLanguage(constants.TEST_LANG_EN);
    expect(fn).to.be.a('function');
    const dispatch = spy();
    fn(dispatch);
    /* setTimeout(() => {
      expect(dispatch.calledWith({
        type: STATE_CHANGE_LANGUAGE,
        actionData: constants.TEST_LANG_EN
      })).to.be.true;
      done();
    }, 5); */
  });
});
