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
const fieldsType = 'fields';

describe('@@ FieldsHelper @@', () => {
  describe('replaceAll', () =>
    it('should clear data', () =>
      expect(actions.replaceAllByFieldsType([], fieldsType)).to.eventually.have.lengthOf(0)
    )
  );

  describe('replaceAll', () =>
    it('should save initial data', () =>
      expect(actions.replaceAllByFieldsType(fieldTrees1, fieldsType)).to.eventually.have.lengthOf(2)
    )
  );

  describe('replaceAll', () =>
    it('should reject input as invalid', () =>
      expect(actions.replaceAllByFieldsType(fieldTrees2, fieldsType)).to.eventually.be.rejected
    )
  );

  describe('findByWorkspaceMemberIdAndType', () =>
    it('should find by workspace id', () =>
      expect(actions.findByWorkspaceMemberIdAndType(1, fieldsType)).to.eventually.deep.equal(fields1)
    )
  );

  describe('findById', () =>
    it('should find by id', () =>
      expect(actions.findByWorkspaceMemberIdAndType(1, fieldsType)
        .then(f => actions.findById(f.id))).to.eventually.deep.equal(fields1)
    )
  );

  describe('deleteById', () =>
    it('should delete by id', () =>
      expect(actions.findByWorkspaceMemberIdAndType(1, fieldsType)
        .then(f => actions.deleteById(f.id))).to.eventually.equal(1)
    )
  );
});
