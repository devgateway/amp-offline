import { Constants, UIUtils } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';
import
{ CLIENT_CHANGE_ID, CLIENT_CHANGE_ID_PREFIX, NAME, LAST_NAME }
from '../../utils/constants/ContactConstants';
import { INTERNAL_ID } from '../../utils/constants/EntityConstants';

const logger = new Logger('Contact helper');

/**
 * A simplified helper for using contacts storage for loading, searching / filtering, saving and deleting contacts.
 * @author Nadejda Mandrescu
 */
const ContactHelper = {

  findContactById(id) {
    logger.debug('findContactById');
    const filterRule = { id };
    return ContactHelper.findContact(filterRule);
  },

  findContactsByIds(ids) {
    logger.debug('findContactsByIds');
    const filterRule = { id: { $in: ids } };
    return ContactHelper.findAllContacts(filterRule);
  },

  findContactByInternalId(internalId) {
    logger.debug('findContactById');
    const filterRule = Utils.toMap(INTERNAL_ID, internalId);
    return ContactHelper.findContact(filterRule);
  },

  findContact(filterRule) {
    logger.debug('findContact');
    return DatabaseManager.findOne(filterRule, Constants.COLLECTION_CONTACTS);
  },

  /**
   * Finds all contacts modified on the AMP Offline client
   * @param filterRule optional additional filter rule
   * @return {Promise}
   */
  findAllContactsModifiedOnClient(filterRule = {}) {
    logger.debug('findAllContactsModifiedOnClient');
    filterRule[CLIENT_CHANGE_ID] = { $exists: true };
    return ContactHelper.findAllContacts(filterRule);
  },

  findAllContactsAsPossibleOptions() {
    return ContactHelper.findAllContacts({}, { id: 1, [NAME]: 1, [LAST_NAME]: 1 })
      .then(contacts => contacts.map(ContactHelper._toPV).reduce((result, cpv) => {
        result[cpv.id] = cpv;
        return result;
      }, {}));
  },

  _toPV(contact) {
    return {
      id: contact.id,
      value: `${contact[NAME]} ${contact[LAST_NAME]}`
    };
  },

  findAllContacts(filterRule, projections) {
    logger.debug('findAllContacts');
    return DatabaseManager.findAll(filterRule, Constants.COLLECTION_CONTACTS, projections);
  },

  stampClientChange(contact) {
    if (!contact[CLIENT_CHANGE_ID]) {
      contact[CLIENT_CHANGE_ID] = `${CLIENT_CHANGE_ID_PREFIX}-${UIUtils.stringToUniqueId(CLIENT_CHANGE_ID_PREFIX)}`;
    }
    if (!contact.id) {
      contact.id = contact[CLIENT_CHANGE_ID];
    }
    if (!contact[INTERNAL_ID]) {
      contact[INTERNAL_ID] = contact.id;
    }
    return contact;
  },

  isNewContact(contact) {
    return contact.id && `${contact.id}`.startsWith(CLIENT_CHANGE_ID_PREFIX);
  },

  /**
   * Checks if the contact is stampped as modified on client (i.e. not yet pushed to AMP)
   * @param contact
   */
  isModifiedOnClient(contact) {
    return !!contact[CLIENT_CHANGE_ID];
  },

  cleanupLocalData(contact) {
    // TODO AMP-27748: these can be removed once extra fields are ignored by API
    const cleanContact = { ...contact };
    if (ContactHelper.isNewContact(contact)) {
      delete cleanContact.id;
    }
    delete cleanContact[CLIENT_CHANGE_ID];
    delete cleanContact._id;
    delete cleanContact[INTERNAL_ID];
    return cleanContact;
  },

  /**
   * Save the contact
   * @param contact
   * @returns {Promise}
   */
  saveOrUpdateContact(contact) {
    logger.log('saveOrUpdateContact');
    ContactHelper._setOrUpdateIds(contact);
    return DatabaseManager.saveOrUpdate(contact.id, contact, Constants.COLLECTION_CONTACTS);
  },

  _setOrUpdateIds(contact) {
    contact.id = contact.id || contact[INTERNAL_ID] || UIUtils.stringToId(contact);
    return contact;
  },

  saveOrUpdateContactCollection(contacts) {
    logger.log('saveOrUpdateContactCollection');
    contacts.forEach(contact => { ContactHelper._setOrUpdateIds(contact); });
    return DatabaseManager.saveOrUpdateCollection(contacts, Constants.COLLECTION_CONTACTS);
  },

  replaceContacts(contacts) {
    logger.log('replaceContact');
    return DatabaseManager.replaceCollection(contacts, Constants.COLLECTION_CONTACTS);
  },

  /**
   * Remove the contact by id
   * @param id
   * @returns {Promise}
   */
  deleteContactById(id) {
    logger.log('deleteContactById');
    return DatabaseManager.removeById(id, Constants.COLLECTION_CONTACTS);
  },

  deleteContactByInternalId(internalId) {
    logger.log('deleteContactByInternalId');
    const filterRule = Utils.toMap(INTERNAL_ID, internalId);
    return DatabaseManager.removeAll(filterRule, Constants.COLLECTION_CONTACTS);
  },

  removeAllByIds(ids) {
    logger.log('removeAllByIds');
    const idsFilter = { id: { $in: ids } };
    return DatabaseManager.removeAll(idsFilter, Constants.COLLECTION_CONTACTS);
  }
};

export default ContactHelper;
