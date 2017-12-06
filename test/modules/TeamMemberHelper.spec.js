import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/TeamMemberHelper';
import { removeIdFromCollection, removeIdFromItem } from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const ws1 = { id: '_testWsId1_', name: 'Test Workspace' };
const ws2 = { id: '_testWsId2_', name: 'Test Workspace2' };
const user1 = { id: '_testUserId1_', name: 'John Smith' };
const user2 = { id: '_testUserId2_', name: 'John Smith2' };
const teamMember1 = { id: '_testTeamMemberId1_', 'user-id': user1.id, 'workspace-id': ws1.id };
const teamMember2 = { id: '_testTeamMemberId2_', 'user-id': user2.id, 'workspace-id': ws2.id };
const teamMember3 = { id: '_testTeamMemberId3_', 'user-id': user2.id, 'workspace-id': ws1.id, deleted: true };
const teamMembers = [teamMember1, teamMember2, teamMember3];

describe('@@ TeamMemberHelper @@', () => {
  describe('saveOrUpdateTeamMember', () =>
    it('should save the team member data', () =>
      expect(actions.saveOrUpdateTeamMember(teamMember1).then(removeIdFromItem)).to.eventually.deep.equal(teamMember1)
    )
  );

  describe('saveGlobalSettings', () =>
    it('should save the team members data', (done) => {
      actions.saveOrUpdateTeamMembers(teamMembers).then((resutlTeamMembers) => {
        expect(removeIdFromCollection(resutlTeamMembers)).to.eql(teamMembers);
        return done();
      }).catch(error => done(error));
    })
  );

  describe('findByUserAndWorkspaceId', () =>
    it('should find the exact team member by user id and workspace id', () =>
      expect(actions.findByUserAndWorkspaceId(user1.id, ws1.id)).to.eventually.deep.equal(teamMember1)
    )
  );

  describe('findByUserAndWorkspaceId', () =>
    it('should find the exact team member by user id and workspace id', () =>
      expect(actions.findByUserAndWorkspaceId(user2.id, ws1.id, true)).to.eventually.deep.equal(null)
    )
  );

  describe('findWorkspaceIdsByUserId', () =>
    it('should find all workspace ids by user id, include deleted', () =>
      expect(actions.findWorkspaceIdsByUserId(user1.id)).to.eventually.deep.equal([ws1.id])
    )
  );

  describe('findWorkspaceIdsByUserId', () =>
    it('should find all workspace ids by user id, exclude deleted', () =>
      expect(actions.findWorkspaceIdsByUserId(user2.id, true)).to.eventually.deep.equal([ws2.id])
    )
  );

  describe('findAllByWorkspaceId', () =>
    it('should find all team members by workspace id excluding deleted', () =>
      expect(actions.findAllByWorkspaceId(ws1.id, true)).to.eventually.deep.equal([teamMember1])
    )
  );

  describe('findAllByWorkspaceId', () =>
    it('should find all team members by workspace id, including deleted', () =>
      expect(actions.findAllByWorkspaceId(ws1.id)).to.eventually.deep.have.same.members([teamMember1, teamMember3])
    )
  );

  describe('deleteById', () =>
    it('should delete the team member data', () =>
      expect(actions.deleteById(teamMember1.id)).to.eventually.equal(1)
    )
  );
});

