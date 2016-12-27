import * as actions from '../../app/modules/helpers/TeamMemberHelper';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


const ws1 = {id: "_testWsId1_", name: "Test Workspace"};
const user1 = {id: "_testUserId1_", name: "John Smith"};
const teamMember1 = {id: "_testTeamMemberId1_", "user-id": user1.id, "workspace-id": ws1.id};

describe('@@ TeamMemberHelper @@', () => {
  it('func saveOrUpdateTeamMember - Should save the teammember data', (done) => {
    expect(actions.saveOrUpdateTeamMember(teamMember1)).to.eventually.deep.equal(teamMember1).notify(done);
  });

  it('func findByUserAndWorkspaceId - Should find the exact teammember by user id and workspace id', (done) => {
    expect(actions.findByUserAndWorkspaceId(user1.id, ws1.id)).to.eventually.deep.equal(teamMember1).notify(done);
  });

  it('func findWorkspaceIdsByUserId - Should find all workspace ids by user id', (done) => {
    expect(actions.findWorkspaceIdsByUserId(user1.id)).to.eventually.deep.equal([ws1.id]).notify(done);
  });

  it('func findAllByWorkspaceId - Should find all teammembers by workspace id', (done) => {
    expect(actions.findAllByWorkspaceId(ws1.id)).to.eventually.deep.equal([teamMember1]).notify(done);
  });

  it('func deleteById - Should delete the teammember data', (done) => {
    expect(actions.deleteById(teamMember1.id)).to.eventually.equal(1).notify(done);
  });
});


