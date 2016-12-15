/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {spy} from 'sinon';
import * as actions from '../../app/actions/TranslationAction';
import * as constants from '../Constants';


describe('@@ TranslationAction @@', () => {
  it('func language - Should set language to english', () => {
    expect(actions.language(constants.TEST_LANG_EN)).to.deep.equal({
      type: actions.STATE_CHANGE_LANGUAGE,
      actionData: constants.TEST_LANG_EN
    });
  });

  it('func setLanguage - Should set language to english', () => {
    const fn = actions.setLanguage(constants.TEST_LANG_EN);
    expect(fn).to.be.a('function');
    const dispatch = spy();
    fn(dispatch);
    expect(dispatch.calledWith({
      type: actions.STATE_CHANGE_LANGUAGE,
      actionData: constants.TEST_LANG_EN
    })).to.be.true;
  });
});
