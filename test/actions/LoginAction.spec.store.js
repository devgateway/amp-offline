/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { spy } from 'sinon';
import * as actions from '../../app/actions/LoginAction';

describe('@@ LoginAction @@', () => {
  it('should dispatch STATE_LOGOUT.', () => {
    const fn = actions.logoutAction;
    expect(fn).to.be.a('function');
    const isInactivityTimeout = false;
    const dispatch = spy();
    return fn(isInactivityTimeout, dispatch).then(() =>
      expect(dispatch.calledWith({ type: actions.STATE_LOGOUT, actionData: { isInactivityTimeout } })).to.be.true
    );
  });
});
