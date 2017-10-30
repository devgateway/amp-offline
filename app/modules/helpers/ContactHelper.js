import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CONTACTS } from '../../utils/Constants';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';
import { CLIENT_CHANGE_ID, CLIENT_CHANGE_ID_PREFIX, INTERNAL_ID } from '../../utils/constants/ContactConstants';

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

  findContactByInternalId(internalId) {
    logger.debug('findContactById');
    const filterRule = Utils.toMap(INTERNAL_ID, internalId);
    return ContactHelper.findContact(filterRule);
  },

  findContact(filterRule) {
    logger.debug('findContact');
    return DatabaseManager.findOne(filterRule, COLLECTION_CONTACTS);
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

  findAllContacts(filterRule, projections) {
    logger.debug('findAllContacts');
    return DatabaseManager.findAll(filterRule, COLLECTION_CONTACTS, projections);
  },

  stampClientChange(contact) {
    contact[CLIENT_CHANGE_ID] = `${CLIENT_CHANGE_ID_PREFIX}-${Utils.stringToUniqueId(CLIENT_CHANGE_ID_PREFIX)}`;
    if (!contact.id) {
      contact.id = contact[CLIENT_CHANGE_ID];
    }
    return contact;
  },

  isNewContact(contact) {
    return contact.id && `${contact.id}`.startsWith(CLIENT_CHANGE_ID_PREFIX);
  },

  cleanupLocalData(contact) {
    const cleanContact = { ...contact };
    if (ContactHelper.isNewContact(contact)) {
      delete cleanContact.id;
    }
    delete cleanContact[CLIENT_CHANGE_ID];
    delete cleanContact._id;
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
    return DatabaseManager.saveOrUpdate(contact.id, contact, COLLECTION_CONTACTS);
  },

  _setOrUpdateIds(contact) {
    contact.id = contact.id || contact[INTERNAL_ID] || Utils.stringToId(contact);
    return contact;
  },

  saveOrUpdateContactCollection(contacts) {
    logger.log('saveOrUpdateContactCollection');
    contacts.forEach(contact => { ContactHelper._setOrUpdateIds(contact); });
    return DatabaseManager.saveOrUpdateCollection(contacts, COLLECTION_CONTACTS);
  },

  replaceContacts(contacts) {
    logger.log('replaceContact');
    return DatabaseManager.replaceCollection(contacts, COLLECTION_CONTACTS);
  },

  /**
   * Remove the contact by id
   * @param id
   * @returns {Promise}
   */
  deleteContactById(id) {
    logger.log('deleteContactById');
    return DatabaseManager.removeById(id, COLLECTION_CONTACTS);
  },

  deleteContactByInternalId(internalId) {
    logger.log('deleteContactByInternalId');
    const filterRule = Utils.toMap(INTERNAL_ID, internalId);
    return DatabaseManager.removeAll(filterRule, COLLECTION_CONTACTS);
  },

  removeAllByIds(ids) {
    logger.log('removeAllByIds');
    const idsFilter = { id: { $in: ids } };
    return DatabaseManager.removeAll(idsFilter, COLLECTION_CONTACTS);
  }
};

export default ContactHelper;
