import { expect } from 'chai';
import { describe, it } from 'mocha';
import userReducer, { STATE_USER_CLEAR } from '../../app/reducers/UserReducer';
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
      expect(userReducer(undefined, {})).to.deep.equal(defaultState)
    )
  );

  describe('userReducer', () =>
    it('should return default state for an incorrect type', () =>
      expect(userReducer(undefined, { type: TEST_FAKE_STATE })).to.deep.equal(defaultState)
    )
  );

  describe('userReducer', () =>
    it('should return the user data without teamMember', () =>
      expect(userReducer(undefined, {
        type: STATE_LOGIN_OK,
        actionData: { userData: { id: '123', name: 'test123' } }
      })).to.deep.equal({
        userData: { id: '123', name: 'test123' },
        teamMember: undefined
      })
    )
  );

  describe('userReducer', () =>
    it('should return user data and teamMember', () => {
      const workspace = { id: '101', name: 'Test Workspace' };
      const user = { id: '202', name: 'Test' };
      const teamMember = { id: '101202', 'user-id': user.id, 'workspace-id': workspace.id, workspace };

      const state = userReducer(undefined, {
        type: STATE_LOGIN_OK,
        actionData: { userData: { id: '123', name: 'test123' } }
      });

      expect(userReducer(state, {
        type: STATE_SELECT_WORKSPACE,
        actionData: { teamMember, workspace }
      })).to.deep.equal({
        userData: { id: '123', name: 'test123' },
        teamMember
      });
    })
  );

  describe('userReducer', () =>
    it('should return undefined user state', () =>
      expect(userReducer({}, {
        type: STATE_LOGOUT,
        actionData: { userData: { id: '123', name: 'test123' }, plainPassword: 'password', token: 'a123456789b' }
      })).to.deep.equal(defaultState)
    )
  );

  describe('userReducer', () =>
    it('should return undefined user state', () =>
      expect(userReducer({}, {
        type: STATE_USER_CLEAR,
        actionData: { userData: { id: '123', name: 'test123' }, plainPassword: 'password', token: 'a123456789b' }
      })).to.deep.equal(defaultState)
    )
  );
});
