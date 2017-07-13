import { describe, it } from 'mocha';
import actions from '../../app/modules/helpers/FMHelper';
import { removeIdFromCollection, removeIdFromItem } from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const tree1 = {
  fmTree: {
    'PROJECT MANAGEMENT': {
      __enabled: true,
      Funding: {
        __enabled: true,
        'Funding Information': {
          __enabled: false,
          'Delivery rate': {
            __enabled: false
          }
        }
      }
    }
  }
};
const tree2 = Object.assign({ id: 2 }, tree1);
const tree3 = Object.assign({ id: 3 }, tree1);
const fmTrees = [tree2, tree3];

describe('@@ FMHelper @@', () => {
  describe('removeAll', () =>
    it('should remove anything existing from FM storage', () =>
      expect(actions.removeAll({})).to.eventually.be.fulfilled
    )
  );

  describe('saveOrUpdate', () =>
    it('should save the FM tree that has an id set', () =>
      expect(actions.saveOrUpdate(tree2).then(removeIdFromItem)).to.eventually.deep.equal(tree2)
    )
  );

  describe('saveOrUpdate', () =>
    it('should save the FM tree that comes without id', () =>
      expect(actions.saveOrUpdate(tree1).then(removeIdFromItem)).to.eventually.deep.equal(tree1)
    )
  );

  describe('saveOrUpdateCollection', () =>
    it('should save the FM tree collection', () =>
      expect(actions.saveOrUpdateCollection(fmTrees)).to.eventually.have.length(2)
    )
  );

  describe('findById', () =>
    it('should find the FM tree by id', () =>
      expect(actions.findById(tree2.id)).to.eventually.deep.equal(tree2)
    )
  );

  describe('replaceAll', () =>
    it('should replace entire FM tree collection', () =>
      expect(actions.replaceAll(fmTrees).then(removeIdFromCollection)).to.eventually.deep.equal(fmTrees)
    )
  );

  describe('removeById', () =>
    it('should remove FM tree by id', () =>
      expect(actions.removeById(tree3.id)).to.eventually.equal(1)
    )
  );

  describe('removeAll', () =>
    it('should remove all FM trees', () =>
      expect(actions.removeAll({})).to.eventually.equal(1)
    )
  );
});
