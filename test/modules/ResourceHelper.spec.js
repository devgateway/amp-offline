import { describe, it } from 'mocha';
import ResourceHelper from '../../app/modules/helpers/ResourceHelper';
import { removeIdFromCollection, removeIdFromItem, toMap } from '../../app/utils/Utils';
import { INTERNAL_ID } from '../../app/utils/constants/EntityConstants';
import { UUID } from '../../app/utils/constants/ResourceConstants';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const ampResource1 = toMap(UUID, '1');
const ampResource1Saved = ResourceHelper._setOrUpdateIds(ampResource1);
const ampResource2 = toMap(UUID, '2');
const ampResource3 = toMap(UUID, '3');
const clientChangedResource1 = ResourceHelper.stampClientChange(ampResource1Saved);
const clientCreatedResource4 = ResourceHelper.stampClientChange({ UUID: '4' });
const initialResources = [ampResource1, ampResource2, ampResource3];
const initialResourcesSaved = initialResources.map(r => ResourceHelper._setOrUpdateIds(r));
const modifiedResources = [clientChangedResource1, clientCreatedResource4];
const modifiedResourcesSaved = modifiedResources.map(r => ResourceHelper._setOrUpdateIds(r));

describe('@@ ResourceHelper @@', () => {
  describe('replaceResources', () =>
    it('should clear data', () =>
      expect(ResourceHelper.replaceResources([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateResource', () =>
    it('should save initial data', () =>
      expect(ResourceHelper.saveOrUpdateResource(ampResource1).then(removeIdFromItem))
        .to.eventually.deep.equal(ampResource1Saved)
    )
  );

  describe('saveOrUpdateResourceCollection', () =>
    it('should save or update initial resources collection', () =>
      expect(ResourceHelper.saveOrUpdateResourceCollection(initialResources).then(removeIdFromCollection))
        .to.eventually.deep.have.same.members(initialResourcesSaved)
    )
  );

  describe('saveOrUpdateResourceCollection', () =>
    it('should save or update modified resources collection', () =>
      expect(ResourceHelper.saveOrUpdateResourceCollection(modifiedResources).then(removeIdFromCollection))
        .to.eventually.deep.have.same.members(modifiedResourcesSaved)
    )
  );

  describe('saveOrUpdateResource', () =>
    it('should save modified data', () =>
      expect(ResourceHelper.saveOrUpdateResource(clientChangedResource1).then(removeIdFromItem))
        .to.eventually.deep.equal(clientChangedResource1)
    )
  );

  describe('findResourceByUuid', () =>
    it('should find resource by uuid', () =>
      expect(ResourceHelper.findResourceByUuid(ampResource1Saved.id))
        .to.eventually.deep.equal(ampResource1Saved)
    )
  );

  describe('findResourceByInternalId', () =>
    it('should find resource by internal id', () =>
      expect(ResourceHelper.findResourceByInternalId(clientCreatedResource4[INTERNAL_ID]))
        .to.eventually.deep.equal(clientCreatedResource4)
    )
  );

  describe('findAllResourcesModifiedOnClient', () =>
    it('should find only resources modified on the client', () =>
      expect(ResourceHelper.findAllResourcesModifiedOnClient())
        .to.eventually.deep.have.same.members(modifiedResourcesSaved)
    )
  );

  describe('deleteResourceById', () =>
    it('should delete resource by id', () =>
      expect(ResourceHelper.deleteResourceById(ampResource1Saved.id)).to.eventually.equal(1)
    )
  );

  describe('deleteResourceByInternalId', () =>
    it('should delete resource by internal id', () =>
      expect(ResourceHelper.deleteResourceByInternalId(clientCreatedResource4[INTERNAL_ID])).to.eventually.equal(1)
    )
  );
});
