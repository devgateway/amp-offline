import { describe, it } from 'mocha';
import * as actions from '../../app/modules/database/DatabaseManager';
import Utils from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const collectionName = 'bulk-save-update';
const init = { id: 1 };
const validSimpleInsertAndUpdate = [{ id: 1 }, { id: 2 }];
const validMultipleInsertAndUpdate = Array.from(Array(100).keys()).map(index => Utils.toMap('id', index));
const invalidSimpleInsert1 = [{ id: 101 }, { id: 101 }];
const invalidSimpleInsert2 = [{ id: null }, { id: undefined }];
const invalidMultipleInsertAndUpdate = validMultipleInsertAndUpdate.concat(invalidSimpleInsert1);

describe('@@ DatabaseManager @@', () => {
  describe('saveOrUpdate', () =>
    it('should save initial data', () =>
      expect(actions.replaceCollection([], collectionName)).to.eventually.have.lengthOf(0)
    )
  );
  describe('saveOrUpdate', () =>
    it('should save initial data', () =>
      expect(actions.saveOrUpdate(1, init, collectionName)).to.eventually.deep.equal(init)
    )
  );

  describe('saveOrUpdateCollection', () =>
    it('should insert and update simple data', () =>
      expect(actions.saveOrUpdateCollection(validSimpleInsertAndUpdate, collectionName))
        .to.eventually.have.lengthOf(validSimpleInsertAndUpdate.length)
    )
  );

  describe('saveOrUpdate', () =>
    it('should saveUpdate multiple data', () =>
      expect(actions.saveOrUpdateCollection(validMultipleInsertAndUpdate, collectionName))
        .to.eventually.have.lengthOf(validMultipleInsertAndUpdate.length)
    )
  );

  describe('saveOrUpdate', () =>
    it('should only update multiple data', () =>
      expect(actions.saveOrUpdateCollection(validMultipleInsertAndUpdate, collectionName))
        .to.eventually.have.lengthOf(validMultipleInsertAndUpdate.length)
    )
  );

  describe('saveOrUpdate', () =>
    it('should fail on invalid simple insert #1', () =>
      expect(actions.saveOrUpdateCollection(invalidSimpleInsert1, collectionName))
        .to.eventually.be.rejected
    )
  );

  describe('saveOrUpdate', () =>
    it('should fail on invalid simple insert #2', () =>
      expect(actions.saveOrUpdateCollection(invalidSimpleInsert2, collectionName))
        .to.eventually.be.rejected
    )
  );

  describe('saveOrUpdate', () =>
    it('should fail on invalid simple insert #3', () =>
      expect(actions.saveOrUpdateCollection(invalidMultipleInsertAndUpdate, collectionName))
        .to.eventually.be.rejected
    )
  );
});
