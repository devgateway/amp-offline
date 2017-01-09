/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import * as actions from '../../app/actions/LoginAction';


describe('@@ LoginAction @@', () => {
  it('func logoutAction - Should dispatch STATE_LOGOUT.', () => {
    expect(actions.logoutAction()).to.deep.equal({
      type: actions.STATE_LOGOUT,
      actionData: undefined
    });
  });
});
