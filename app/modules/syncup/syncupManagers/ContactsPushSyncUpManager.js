/* eslint-disable class-methods-use-this */
import SyncUpManagerInterface from './SyncUpManagerInterface';
import { SYNCUP_TYPE_CONTACTS_PUSH } from '../../../utils/Constants';
import ContactHelper from '../../helpers/ContactHelper';
import Logger from '../../util/LoggerManager';
import { CONTACT_PUSH_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import { ACTIVITY_CONTACT_PATHS } from '../../../utils/constants/FieldPathConstants';
import * as Utils from '../../../utils/Utils';
import * as ActivityHelper from '../../helpers/ActivityHelper';

const logger = new Logger('Contacts push sync up manager');

/**
 * Pushes new and modified contacts to AMP
 * @author Nadejda Mandrescu
 */
export default class ContactsPushSyncUpManager extends SyncUpManagerInterface {
  constructor() {
    super(SYNCUP_TYPE_CONTACTS_PUSH);
    this._cancel = false;
    this.diff = [];
    this.pushed = new Set();
  }

  cancel() {
    this._cancel = true;
  }

  getDiffLeftover() {
    this.diff = this.diff.filter(id => !this.pushed.has(id));
    return this.diff;
  }

  doSyncUp() {
    return ContactHelper.findAllContactsModifiedOnClient()
      .then(this._pushContacts.bind(this))
      .then(() => {
        this.done = true;
        return this.done;
      });
  }

  _pushContacts(contacts) {
    logger.debug('_pushContacts');
    this.diff = contacts.map(contact => contact.id);
    if (!contacts) {
      return Promise.resolve();
    }
    // executing push one by one for now and sequentially to avoid AMP / client overload
    return contacts.reduce((currentPromise, nextContact) =>
      currentPromise.then(() => {
        if (this._cancel === true) {
          return Promise.resolve();
        }
        // uninterruptible call
        return this._pushContact(nextContact);
      }), Promise.resolve());
  }

  _pushContact(contact) {
    const isNewContact = ContactHelper.isNewContact(contact);
    const requestFunc = isNewContact ? ConnectionHelper.doPut : ConnectionHelper.doPost;
    const extraUrlParam = isNewContact ? undefined : contact.id;
    const request = {
      url: CONTACT_PUSH_URL,
      body: ContactHelper.cleanupLocalData(contact),
      shouldRetry: false,
      extraUrlParam
    };
    return requestFunc(request)
      .then(pushResult => this._processResult({ contact, pushResult, isNewContact, clientChangeId: extraUrlParam }))
      .catch(error => this._processResult({ contact, error, isNewContact, clientChangeId: extraUrlParam }));
  }

  _processResult({ contact, pushResult, error, isNewContact }) {
    if (pushResult) {
      this.pushed.add(contact.id);
    }
    const errorData = (error && error.message) || error || (pushResult && pushResult.error) || undefined;
    if (errorData) {
      logger.error(errorData);
      this.addError(errorData);
      return Promise.resolve();
    } else {
      return this._cleanupIfIsNewContact(contact, pushResult, isNewContact)
        .then(() => ContactHelper.saveOrUpdateContact(pushResult));
    }
  }

  _cleanupIfIsNewContact(contact, pushResult, isNewContact) {
    if (isNewContact) {
      return ContactHelper.deleteContactById(contact.id)
        .then(() => this._updateNewContactToActualIdsInActivities(contact.id, pushResult.id));
    }
    return Promise.resolve();
  }

  _updateNewContactToActualIdsInActivities(tmpContactId, newContactId) {
    const queries = ACTIVITY_CONTACT_PATHS.map(cType => Utils.toMap(cType, { $elemMatch: tmpContactId }));
    const filter = { $or: queries };
    return ActivityHelper.findAllNonRejected(filter).then(activities => {
      activities.forEach(activity => {
        ACTIVITY_CONTACT_PATHS.forEach(cType => {
          const contacts = activity[cType];
          const idx = contacts.findIndex(c => c === tmpContactId);
          if (idx !== -1) {
            contacts[idx] = newContactId;
          }
        });
      });
      return ActivityHelper.saveOrUpdateCollection(activities);
    });
  }

}
