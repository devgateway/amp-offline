import * as actions from '../../app/modules/helpers/WorkspaceHelper';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const ws1 = {id: "_testWsId1_", name: "Test Workspace"};
const ws2 = {id: "_testWsId2_", name: "Test Workspace"};

describe('@@ WorkspaceHelper @@', () => {
  it('func saveOrUpdateWorkspace - Should save the WS data', (done) => {
    expect(actions.saveOrUpdateWorkspace(ws1)).to.eventually.deep.equal(ws1).notify(done);
  });

  it('func findById - Should find the WS data', (done) => {
    expect(actions.findById("_testWsId1_")).to.eventually.deep.equal(ws1).notify(done);
  });

  it('func findByName - Should find the WS data', (done) => {
    expect(actions.findByName("Test Workspace")).to.eventually.deep.equal(ws1).notify(done);
  });

  it('func deleteById - Should delete test WS data', (done) => {
    expect(actions.deleteById("_testWsId1_")).to.eventually.equal(1).notify(done);
  });
});
