import { describe, it } from 'mocha';
import { removeIdFromCollection, removeIdFromItem } from '../../app/utils/Utils';
import { HASH, PATH } from '../../app/utils/constants/ResourceConstants';
import RepositoryHelper from '../../app/modules/helpers/RepositoryHelper';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const content1 = {
  id: 'doc1',
  [HASH]: 'cf23df2207d99a74fbe169e3eba035e633b65d94',
  [PATH]: '/7a/0b/doc1',
};
const content2 = {
  id: 'doc2',
  [HASH]: 'bf23df2207d99a74fbe169e3eba035e633b65d94',
  [PATH]: '/7a/0b/doc2',
};
const contents = [content1, content2];

describe('@@ ResourceHelper @@', () => {
  describe('replaceContents', () =>
    it('should clear data', () =>
      expect(RepositoryHelper.replaceContents([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateContent', () =>
    it('should save initial data', () =>
      expect(RepositoryHelper.saveOrUpdateContent(content1).then(removeIdFromItem))
        .to.eventually.deep.equal(content1)
    )
  );

  describe('saveOrUpdateContentCollection', () =>
    it('should save or update initial contents collection', () =>
      expect(RepositoryHelper.saveOrUpdateContentCollection(contents).then(removeIdFromCollection))
        .to.eventually.deep.have.same.members(contents)
    )
  );

  describe('findContentById', () =>
    it('should find content by id', () =>
      expect(RepositoryHelper.findContentById(content1.id))
        .to.eventually.deep.equal(content1)
    )
  );

  describe('findContentByHash', () =>
    it('should find content by hash', () =>
      expect(RepositoryHelper.findContentByHash(content1[HASH]))
        .to.eventually.deep.equal(content1)
    )
  );

  describe('findContentsByIds', () =>
    it('should find specified contents', () =>
      expect(RepositoryHelper.findContentsByIds([content1.id, content2.id]))
        .to.eventually.deep.have.same.members(contents)
    )
  );

  describe('deleteContentById', () =>
    it('should delete content by id', () =>
      expect(RepositoryHelper.deleteContentById(content1.id)).to.eventually.equal(1)
    )
  );
});
