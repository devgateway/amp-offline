import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/FieldsHelper';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const fields1 = { 'ws-member-ids': [1, 2], fields: { internal_id: {} } };
const fields2 = { 'ws-member-ids': [3, 4], fields: { internal_id: {} } };
const fields3 = { 'ws-member-ids': [1, 4], fields: { internal_id: {} } };
const fieldTrees1 = [fields1, fields2];
const fieldTrees2 = [fields1, fields2, fields3];

describe('@@ FieldsHelper @@', () => {
  describe('replaceAll', () =>
    it('should clear data', () =>
      expect(actions.replaceAll([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('replaceAll', () =>
    it('should save initial data', () =>
      expect(actions.replaceAll(fieldTrees1)).to.eventually.have.lengthOf(2)
    )
  );

  describe('replaceAll', () =>
    it('should reject input as invalid', () =>
      expect(actions.replaceAll(fieldTrees2)).to.eventually.be.rejected
    )
  );

  describe('findByWorkspaceMemberId', () =>
    it('should find by workspace id', () =>
      expect(actions.findByWorkspaceMemberId(1)).to.eventually.deep.equal(fields1)
    )
  );

  describe('findById', () =>
    it('should find by id', () =>
      expect(actions.findByWorkspaceMemberId(1).then(f => actions.findById(f.id))).to.eventually.deep.equal(fields1)
    )
  );

  describe('deleteById', () =>
    it('should delete by id', () =>
      expect(actions.findByWorkspaceMemberId(1).then(f => actions.deleteById(f.id))).to.eventually.equal(1)
    )
  );
});
