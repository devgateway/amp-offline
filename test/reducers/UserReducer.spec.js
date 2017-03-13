import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as userReducer from '../../app/reducers/UserReducer';
import { STATE_LOGIN_OK, STATE_LOGOUT } from '../../app/actions/LoginAction';
import { STATE_SELECT_WORKSPACE } from '../../app/actions/WorkspaceAction';
import { TEST_FAKE_STATE } from '../Constants';

const defaultState = {
  userData: undefined,
  teamMember: undefined
};

describe('@@ UserReducer @@', () => {
  describe('userReducer', () =>
    it('should return default state with empty params.', () =>
      expect(userReducer.user(undefined, {})).to.deep.equal(defaultState)
    )
  );

  describe('userReducer', () =>
    it('should return default state for an incorrect type', () =>
      expect(userReducer.user(undefined, { type: TEST_FAKE_STATE })).to.deep.equal(defaultState)
    )
  );

  describe('userReducer', () =>
    it('should return the user data without teamMember', () =>
      expect(userReducer.user(undefined, {
        type: STATE_LOGIN_OK,
        actionData: { userData: { id: '123', name: 'test123' }, plainPassword: 'password', token: 'a123456789b' }
      })).to.deep.equal({
        userData: { id: '123', name: 'test123' },
        teamMember: undefined,
        plainPassword: 'password',
        token: 'a123456789b'
      })
    )
  );

  describe('userReducer', () =>
    it('should return user data and teamMember', () => {
      const workspace = { id: '101', name: 'Test Workspace' };
      const user = { id: '202', name: 'Test' };
      const teamMember = { id: '101202', 'user-id': user.id, 'workspace-id': workspace.id, workspace };

      const state = userReducer.user(undefined, {
        type: STATE_LOGIN_OK,
        actionData: { userData: { id: '123', name: 'test123' }, plainPassword: 'password', token: 'a123456789b' }
      });

      expect(userReducer.user(state, {
        type: STATE_SELECT_WORKSPACE,
        actionData: { teamMember, workspace }
      })).to.deep.equal({
        userData: { id: '123', name: 'test123' },
        plainPassword: 'password',
        token: 'a123456789b',
        teamMember
      });
    })
  );

  describe('userReducer', () =>
    it('should return undefined user state', () =>
      expect(userReducer.user({}, {
        type: STATE_LOGOUT,
        actionData: { userData: { id: '123', name: 'test123' }, plainPassword: 'password', token: 'a123456789b' }
      })).to.deep.equal(defaultState)
    )
  );

  describe('userReducer', () =>
    it('should return undefined user state', () =>
      expect(userReducer.user({}, {
        type: userReducer.STATE_USER_CLEAR,
        actionData: { userData: { id: '123', name: 'test123' }, plainPassword: 'password', token: 'a123456789b' }
      })).to.deep.equal(defaultState)
    )
  );
});
