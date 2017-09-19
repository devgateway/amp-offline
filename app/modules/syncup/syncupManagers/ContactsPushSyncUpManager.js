import SyncUpManagerInterface from './SyncUpManagerInterface';
import { SYNCUP_TYPE_CONTACTS_PUSH } from '../../../utils/Constants';
import ContactHelper from '../../helpers/ContactHelper';
import LoggerManager from '../../util/LoggerManager';
import { CONTACT_PUSH_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';

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
    LoggerManager.debug('_pushContacts');
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
      LoggerManager.error(errorData);
      this.addError(errorData);
    } else if (isNewContact) {
      // TODO AMPOFFLINE-706 update activities references
      return ContactHelper.deleteContactById(contact.id).then(() => {
        contact.id = pushResult.id;
        return ContactHelper.saveOrUpdateContact(contact);
      });
    }
  }

}
