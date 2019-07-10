import { describe, it } from 'mocha';
import ChangesetHelper from '../../app/modules/helpers/ChangesetHelper';
import * as MC from '../../app/utils/constants/MigrationsConstants';
import * as Utils from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const changeset1 = {
  [MC.CHANGEID]: 'AMPOFFLINE-1289',
  [MC.AUTHOR]: 'nmandrescu',
  [MC.FILENAME]: 'changelog-1.4.0.js',
  [MC.CONTEXT]: MC.CONTEXT_STARTUP,
  [MC.COMMENT]: 'Adding new resource_type field with defaults',
  [MC.MD5SUM]: 'EFF845E7421550B62CEF6FE851492D08'
};

const changeset2 = {
  [MC.CHANGEID]: 'AMPOFFLINE-1289-2',
  [MC.AUTHOR]: 'nmandrescu',
  [MC.FILENAME]: 'changelog-1.4.0.js',
  [MC.CONTEXT]: MC.CONTEXT_STARTUP,
  [MC.COMMENT]: 'Adding new resource_type field with defaults',
  [MC.MD5SUM]: 'EFF845E7421550B62CEF6FE851492D08'
};

const changesets = [changeset1, changeset2];
changesets.forEach(c => { c.id = `${c[MC.CHANGEID]}-${c[MC.AUTHOR]}-${c[MC.FILENAME]}`; });

describe('@@ ChangesetHelper @@', () => {
  describe('replaceChangesets', () =>
    it('should clear data', () =>
      expect(ChangesetHelper.replaceChangesets([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateChangeset', () =>
    it('should save initial data', () =>
      expect(ChangesetHelper.saveOrUpdateChangeset(changeset1).then(Utils.removeIdFromItem))
        .to.eventually.deep.equal(changeset1)
    )
  );

  describe('saveOrUpdateChangesetCollection', () =>
    it('should save the changesets data', () =>
      expect(ChangesetHelper.saveOrUpdateChangesetCollection(changesets).then(Utils.removeIdFromCollection))
        .to.eventually.deep.have.same.members(changesets)
    )
  );

  describe('findChangesetById', () =>
    it('should find changeset by id', () =>
      expect(ChangesetHelper.findChangesetById(changeset1.id)).to.eventually.deep.equal(changeset1)
    )
  );

  describe('findChangesetsByIds', () =>
    it('should find changesets by ids', () =>
      expect(ChangesetHelper.findChangesetsByIds(changesets.map(c => c.id)).then(Utils.removeIdFromCollection))
        .to.eventually.deep.equal(changesets)
    )
  );

  describe('deleteChangesetById', () =>
    it('should delete changeset', () =>
      expect(ChangesetHelper.deleteChangesetById(changeset2.id)).to.eventually.equal(1)
    )
  );
});
