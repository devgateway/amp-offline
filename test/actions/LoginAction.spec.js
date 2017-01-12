/* eslint-disable no-unused-expressions */
import * as actions from '../../app/actions/LoginAction';
import { ampStartUp } from '../../app/actions/StartUpAction';
import { expect } from 'chai';
import { spy } from 'sinon';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('@@ LoginAction @@', () => {

  it('func logoutAction - Should dispatch STATE_LOGOUT.', (done) => {
    const fn = actions.logoutAction();
    expect(fn).to.be.a('function');
    const dispatch = spy();
    fn(dispatch);
    /* We use a quick timeout because this action doesnt return a promise just dispatches an action,
     so we cant use this example: http://redux.js.org/docs/recipes/WritingTests.html */
    setTimeout(() => {
      expect(dispatch.calledWith({type: actions.STATE_LOGOUT})).to.be.true;
      done();
    }, 5);
  });

  /**
   * This is an example of a full action test,
   * I might leave it commented until we define if we will have a testing server for interaction with EP.
   * NOTICE: Online login cant be tested until we figure out how to import
   *  native window.crypto to the test platform (without having the browser).
   */
  /*it('func loginAction - Should dispatch STATE_LOGIN_OK.', (done) => {
    ampStartUp().then(() => {
      const store = mockStore(actions.STATE_LOGOUT);
      return store.dispatch(actions.loginAction('testuser@amp.org', '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8'))
        .then(() => { // return of async actions
          expect(store.getActions()).toEqual(actions.STATE_LOGIN_OK);
          done();
        })
    });
  });*/
});
