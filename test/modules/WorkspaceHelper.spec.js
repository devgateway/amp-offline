import {expect} from 'chai';
import * as actions from '../../app/modules/helpers/WorkspaceHelper';

const ws1 = {_id: "_testWsId1_", id: "_testWsId1_", name: "Test Workspace"};

describe('@@ WorkspaceHelper @@', () => {
  it('func saveOrUpdateWorkspace - Should save the WS data', () => {
    actions.saveOrUpdateWorkspace(ws1).then((workspace) => {
      ws1._id = workspace._id;
      expect(workspace).to.deep.equal(ws1);
    }).catch((error) => {console.log(error);});
  });
});

describe('@@ WorkspaceHelper @@', () => {
  it('func findById - Should find the WS data', () => {
    actions.findById("_testId1_").then((workspace) => {
      ws1._id = workspace._id;
      expect(workspace).to.deep.equal(ws1);
    }).catch((error) => {console.log(error);});
  });
});

describe('@@ WorkspaceHelper @@', () => {
  it('func findByName - Should find the WS data', () => {
    actions.findByName("Test Workspace").then((workspace) => {
      ws1._id = workspace._id;
      expect(workspace).to.deep.equal(ws1);
    }).catch((error) => {console.log(error);});
  });
});

describe('@@ WorkspaceHelper @@', () => {
  it('func deleteById - Should delete test data the WS data', () => {
    actions.deleteById("_testId1_").then((count) => {
      console.log(count);
      expect(count).equal(1);
    }).catch((error) => {console.log(error);});
  });
});
