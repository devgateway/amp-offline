import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/WorkspaceHelper';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const ws1 = { id: '_testWsId1_', name: 'Test Workspace' };
// const ws2 = { id: '_testWsId2_', name: 'Test Workspace' };

describe('@@ WorkspaceHelper @@', () => {
  describe('saveOrUpdateWorkspace', () =>
    it('should save the WS data', () =>
      expect(actions.saveOrUpdateWorkspace(ws1)).to.eventually.deep.equal(ws1)
    )
  );

  describe('findById', () =>
    it('should find the WS data', () =>
      expect(actions.findById('_testWsId1_')).to.eventually.deep.equal(ws1)
    )
  );

  describe('findByName', () =>
    it('should find the WS data', () =>
      expect(actions.findByName('Test Workspace')).to.eventually.deep.equal(ws1)
    )
  );

  describe('deleteById', () =>
    it('should delete test WS data', () =>
      expect(actions.deleteById('_testWsId1_')).to.eventually.equal(1)
    )
  );
});
