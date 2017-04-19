/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { spy } from 'sinon';
import * as actions from '../../app/actions/LoginAction';

describe('@@ LoginAction @@', () => {
  it('should dispatch STATE_LOGOUT.', (done) => {
    const fn = actions.logoutAction();
    expect(fn).to.be.a('function');
    const dispatch = spy();
    fn(dispatch);
    /* We use a quick timeout because this action doesnt return a promise just dispatches an action,
     so we cant use this example: http://redux.js.org/docs/recipes/WritingTests.html */
    setTimeout(() => {
      expect(dispatch.calledWith({ type: actions.STATE_LOGOUT })).to.be.true;
      done();
    }, 5);
  });
});
