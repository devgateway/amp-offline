import { expect } from 'chai';
import userReducer from '../../app/reducers/UserReducer';
import { STATE_USER_CLEAR } from '../../app/reducers/UserReducer';
import { STATE_LOGIN_OK, STATE_LOGOUT } from '../../app/actions/LoginAction';
import { STATE_SELECT_WORKSPACE } from '../../app/actions/WorkspaceAction';
import { TEST_FAKE_STATE } from '../Constants'

const defaultState = {
  userData: undefined,
  teamMember: undefined
};

describe('@@ UserReducer @@', () => {
  it('func userReducer - Test Type: Should return default state with empty params.', () => {
    expect(userReducer(undefined, {})).to.deep.equal(defaultState);
  });

  it('func userReducer - Test Type: Should return default state for an incorrect type', () => {
    expect(userReducer(undefined, {type: TEST_FAKE_STATE})).to.deep.equal(defaultState);
  });

  it('func userReducer - Test type: STATE_LOGIN_OK should return the user data without teamMember', () => {
    expect(userReducer(undefined, {
      type: STATE_LOGIN_OK,
      actionData: {userData: {id: "123", name: "test123"}, plainPassword: "abc", token: "a123456789b"}
    })).to.deep.equal({
      userData: {id: "123", name: "test123"},
      teamMember: undefined,
      plainPassword: "abc",
      token: "a123456789b"
    });
  });

  it('func userReducer - Test type: STATE_SELECT_WORKSPACE should return user data and teamMember', () => {
    let workspace = {id: "101", name: "Test Workspace"};
    let user = {id: "202", name: "Atl"};
    let teamMember = {id: "101202", "user-id": user.id, "workspace-id": workspace.id, workspace: workspace};

    let state = userReducer(undefined, {
      type: STATE_LOGIN_OK,
      actionData: {userData: {id: "123", name: "test123"}, plainPassword: "abc", token: "a123456789b"}
    });

    expect(userReducer(state, {
      type: STATE_SELECT_WORKSPACE,
      actionData: {teamMember: teamMember, workspace: workspace}
    })).to.deep.equal({
      userData: {id: "123", name: "test123"},
      plainPassword: "abc",
      token: "a123456789b",
      teamMember: teamMember
    });
  });

  it('func userReducer - Test type: STATE_LOGOUT should return undefined user state', () => {
    expect(userReducer({}, {
      type: STATE_LOGOUT,
      actionData: {userData: {id: "123", name: "test123"}, plainPassword: "abc", token: "a123456789b"}
    })).to.deep.equal(defaultState);
  });

  it('func userReducer - Test type: STATE_USER_CLEAR should return undefined user state', () => {
    expect(userReducer({}, {
      type: STATE_USER_CLEAR,
      actionData: {userData: {id: "123", name: "test123"}, plainPassword: "abc", token: "a123456789b"}
    })).to.deep.equal(defaultState);
  });
});
