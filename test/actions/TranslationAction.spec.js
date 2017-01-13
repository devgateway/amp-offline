/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { spy } from 'sinon';
import * as actions from '../../app/actions/TranslationAction';
import * as constants from '../Constants';


describe('@@ TranslationAction @@', () => {
  it('should set language to english -> func language', () => {
    expect(actions.language(constants.TEST_LANG_EN)).to.deep.equal({
      type: actions.STATE_CHANGE_LANGUAGE,
      actionData: constants.TEST_LANG_EN
    });
  });

  it('should set language to english -> func setLanguage', () => {
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
