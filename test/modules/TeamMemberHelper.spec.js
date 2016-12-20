import {expect} from 'chai';
import * as actions from '../../app/modules/helpers/TeamMemberHelper';

const ws1 = {id: "_testWsId1_", name: "Test Workspace"};
const user1 = {id: "_testUserId1_", name: "John Smith"};
const teamMember1 = {id: "_testTeamMemberId1_", "user-id": user1.id, "workspace-id": ws1.id};

describe('@@ TeamMemberHelper @@', () => {
  it('func saveOrUpdateTeamMember - Should save the teammember data', () => {
    actions.saveOrUpdateTeamMember(teamMember1).then((teammember) => {
      expect(teammember).to.deep.equal(teamMember1);
    }).catch((error) => {console.log(error);});
  });
});

describe('@@ TeamMemberHelper @@', () => {
  it('func findByUserAndWorkspaceId - Should find the exact teammember by user id and workspace id', () => {
    actions.findByUserAndWorkspaceId(user1.id, ws1.id).then((teammember) => {
      expect(teammember).to.deep.equal(teamMember1);
    }).catch((error) => {console.log(error);});
  });
});

describe('@@ TeamMemberHelper @@', () => {
  it('func findWorkspaceIdsByUserId - Should find all workspace ids by user id', () => {
    actions.findWorkspaceIdsByUserId(user1.id).then((result) => {
      expect(result).to.deep.equal([ws1.id]);
    }).catch((error) => {console.log(error);});
  });
});

describe('@@ TeamMemberHelper @@', () => {
  it('func findAllByWorkspaceId - Should find all teammembers by workspace id', () => {
    actions.findAllByWorkspaceId(ws1.id).then((result) => {
      expect(result).to.deep.equal([teamMember1]);
    }).catch((error) => {console.log(error);});
  });
});


describe('@@ TeamMemberHelper @@', () => {
  it('func deleteById - Should delete the teammember data', () => {
    actions.deleteById(teamMember1.id).then((count) => {
      expect(count).equal(1);
    }).catch((error) => {console.log(error);});
  });
});


