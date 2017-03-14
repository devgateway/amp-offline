import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/TeamMemberHelper';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);


const ws1 = { id: '_testWsId1_', name: 'Test Workspace' };
const user1 = { id: '_testUserId1_', name: 'John Smith' };
const teamMember1 = { id: '_testTeamMemberId1_', 'user-id': user1.id, 'workspace-id': ws1.id };

describe('@@ TeamMemberHelper @@', () => {
  describe('saveOrUpdateTeamMember', () =>
    it('should save the team member data', () =>
      expect(actions.saveOrUpdateTeamMember(teamMember1)).to.eventually.deep.equal(teamMember1)
    )
  );

  describe('findByUserAndWorkspaceId', () =>
    it('should find the exact team member by user id and workspace id', () =>
      expect(actions.findByUserAndWorkspaceId(user1.id, ws1.id)).to.eventually.deep.equal(teamMember1)
    )
  );

  describe('findWorkspaceIdsByUserId', () =>
    it('should find all workspace ids by user id', () =>
      expect(actions.findWorkspaceIdsByUserId(user1.id)).to.eventually.deep.equal([ws1.id])
    )
  );

  describe('findAllByWorkspaceId', () =>
    it('should find all team members by workspace id', () =>
      expect(actions.findAllByWorkspaceId(ws1.id)).to.eventually.deep.equal([teamMember1])
    )
  );

  describe('deleteById', () =>
    it('should delete the team member data', () =>
      expect(actions.deleteById(teamMember1.id)).to.eventually.equal(1)
    )
  );
});

