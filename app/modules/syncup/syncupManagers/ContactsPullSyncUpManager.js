import ContactHelper from '../../helpers/ContactHelper';
import { SYNCUP_TYPE_CONTACTS_PULL } from '../../../utils/Constants';
import { CONTACT_PULL_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Contacts pull syncup manager');

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest contacts data from AMP
 * @author Nadejda Mandrescu
 */
export default class ContactsPullSyncUpManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_CONTACTS_PULL);
  }

  removeEntries() {
    return ContactHelper.removeAllByIds(this.diff.removed).then((result) => {
      this.diff.removed = [];
      return result;
    });
  }

  pullNewEntries() {
    const requestConfigurations = this.diff.saved.map(id => {
      const pullConfig = {
        getConfig: {
          shouldRetry: true,
          url: CONTACT_PULL_URL,
          extraUrlParam: id
        },
        onPullError: [id]
      };
      return pullConfig;
    });
    return this.pullNewEntriesInBatches(requestConfigurations);
  }

  processEntryPullResult(contact, error) {
    if (!error && contact) {
      return this._saveNewContact(contact);
    }
    return this.onPullError(error, contact && contact.id);
  }

  _saveNewContact(contact) {
    return ContactHelper.saveOrUpdateContact(contact)
      .then(() => {
        this.pulled.add(contact.id);
        return contact;
      }).catch((err) => this.onPullError(err, contact.id));
  }

  onPullError(error, contactId) {
    logger.error(`Contact id=${contactId} pull error: ${error}`);
    return error;
  }

}
