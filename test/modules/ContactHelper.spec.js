import { describe, it } from 'mocha';
import ContactHelper from '../../app/modules/helpers/ContactHelper';
import { removeIdFromCollection, removeIdFromItem, toMap } from '../../app/utils/Utils';
import { INTERNAL_ID } from '../../app/utils/constants/EntityConstants';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const unmodifiedContact1 = toMap(INTERNAL_ID, 1);
const unmodifiedContact1Saved = ContactHelper._setOrUpdateIds(unmodifiedContact1);
const unmodifiedContact2 = toMap(INTERNAL_ID, 2);
const unmodifiedContact3 = toMap(INTERNAL_ID, 3);
const clientChangedContact1 = ContactHelper.stampClientChange(unmodifiedContact1Saved);
const clientCreatedContact4 = ContactHelper.stampClientChange({ name: 'Contact 4' });
const initialContacts = [unmodifiedContact1, unmodifiedContact2, unmodifiedContact3];
const initialContactsSaved = initialContacts.map(c => ContactHelper._setOrUpdateIds(c));
const modifiedContacts = [clientChangedContact1, clientCreatedContact4];
const modifiedContactsSaved = modifiedContacts.map(c => ContactHelper._setOrUpdateIds(c));

describe('@@ ContactHelper @@', () => {
  describe('replaceContact', () =>
    it('should clear data', () =>
      expect(ContactHelper.replaceContacts([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateContact', () =>
    it('should save initial data', () =>
      expect(ContactHelper.saveOrUpdateContact(unmodifiedContact1).then(removeIdFromItem))
        .to.eventually.deep.equal(unmodifiedContact1Saved)
    )
  );

  describe('saveOrUpdateContactCollection', () =>
    it('should save or update initial contacts collection', () =>
      expect(ContactHelper.saveOrUpdateContactCollection(initialContacts).then(removeIdFromCollection))
        .to.eventually.deep.have.same.members(initialContactsSaved)
    )
  );

  describe('saveOrUpdateContactCollection', () =>
    it('should save or update modified contacts collection', () =>
      expect(ContactHelper.saveOrUpdateContactCollection(modifiedContacts).then(removeIdFromCollection))
        .to.eventually.deep.have.same.members(modifiedContactsSaved)
    )
  );

  describe('saveOrUpdateContact', () =>
    it('should save modified data', () =>
      expect(ContactHelper.saveOrUpdateContact(clientChangedContact1).then(removeIdFromItem))
        .to.eventually.deep.equal(clientChangedContact1)
    )
  );

  describe('findContactById', () =>
    it('should find contact by id', () =>
      expect(ContactHelper.findContactById(unmodifiedContact1Saved.id))
        .to.eventually.deep.equal(unmodifiedContact1Saved)
    )
  );

  describe('findContactByInternalId', () =>
    it('should find contact by internal id', () =>
      expect(ContactHelper.findContactByInternalId(unmodifiedContact1Saved.id))
        .to.eventually.deep.equal(unmodifiedContact1Saved)
    )
  );

  describe('findAllContactsModifiedOnClient', () =>
    it('should find only contacts modified on the client', () =>
      expect(ContactHelper.findAllContactsModifiedOnClient())
        .to.eventually.deep.have.same.members(modifiedContactsSaved)
    )
  );

  describe('deleteContactById', () =>
    it('should delete contact by id', () =>
      expect(ContactHelper.deleteContactById(unmodifiedContact1Saved.id)).to.eventually.equal(1)
    )
  );

  describe('deleteContactByInternalId', () =>
    it('should delete contact by internal id', () =>
      expect(ContactHelper.deleteContactByInternalId(unmodifiedContact2[INTERNAL_ID])).to.eventually.equal(1)
    )
  );
});
