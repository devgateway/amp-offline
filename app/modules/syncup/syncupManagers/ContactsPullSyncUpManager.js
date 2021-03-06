import { ActivityConstants, Constants, FieldPathConstants } from 'amp-ui';
import ContactHelper from '../../helpers/ContactHelper';
import { CONTACT_BATCHES_PULL_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import Logger from '../../util/LoggerManager';
import * as Utils from '../../../utils/Utils';
import * as ActivityHelper from '../../helpers/ActivityHelper';

const logger = new Logger('Contacts pull syncup manager');

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest contacts data from AMP
 * @author Nadejda Mandrescu
 */
export default class ContactsPullSyncUpManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_CONTACTS_PULL);
    this.unlinkRemovedContactsFromActivities = this.unlinkRemovedContactsFromActivities.bind(this);
    this.unlinkRemovedContactsFromActivity = this.unlinkRemovedContactsFromActivity.bind(this);
  }

  removeEntries() {
    const removedContactIds = this.diff.removed;
    return ContactHelper.removeAllByIds(removedContactIds).then(() => {
      // clear diff immediately
      this.diff.removed = [];
      return this.unlinkRemovedContactsFromActivities(removedContactIds);
    });
  }

  unlinkRemovedContactsFromActivities(removedContactIds) {
    if (!removedContactIds || !removedContactIds.length) {
      return removedContactIds;
    }
    const matchContact = Utils.toMap(ActivityConstants.CONTACT, { $in: removedContactIds });
    const queries = FieldPathConstants.ACTIVITY_CONTACT_PATHS.map(type =>
      Utils.toMap(type, { $elemMatch: matchContact }));
    const filter = { $or: queries };
    // When a contact is deleted from Address Book in AMP, it is automatically removed from activities.
    // The activity itself is not reported as modified on the server.
    // Therefore also simply removing deleted contacts from local AMP Offline activities as well.
    return ActivityHelper.findAllNonRejected(filter).then(activities => {
      activities.forEach(activity => this.unlinkRemovedContactsFromActivity(activity, removedContactIds));
      return ActivityHelper.saveOrUpdateCollection(activities);
    });
  }

  unlinkRemovedContactsFromActivity(activity, removedContactIds) {
    FieldPathConstants.ACTIVITY_CONTACT_PATHS.forEach(contactType => {
      let contacts = activity[contactType];
      if (contacts && contacts.length) {
        contacts = contacts.filter(contact => !removedContactIds.includes(contact[ActivityConstants.CONTACT]));
        activity[contactType] = contacts;
      }
    });
  }

  pullNewEntries() {
    const requestConfigurations = [];
    const { saved } = this.diff;
    for (let idx = 0; idx < saved.length; idx += Constants.SYNCUP_CONTACTS_PULL_BATCH_SIZE) {
      const batchIds = saved.slice(idx, idx + Constants.SYNCUP_CONTACTS_PULL_BATCH_SIZE);
      requestConfigurations.push({
        postConfig: {
          shouldRetry: true,
          url: CONTACT_BATCHES_PULL_URL,
          body: batchIds
        },
        onPullError: batchIds
      });
    }
    return this.pullNewEntriesInBatches(requestConfigurations);
  }

  processEntryPullResult(contacts, error) {
    if (!error && contacts) {
      const contactsWithError = [];
      contacts = contacts.filter(c => {
        if (c.error) {
          contactsWithError.push(c);
          return false;
        }
        return true;
      });
      this.onContactsWithError(contactsWithError, error);
      return this._saveNewContacts(contacts);
    }
    return this.onContactsWithError(contacts, error);
  }

  _saveNewContacts(contacts) {
    return ContactHelper.saveOrUpdateContactCollection(contacts)
      .then(() => {
        contacts.forEach(c => this.pulled.add(c.id));
        return contacts;
      }).catch(err => this.onContactsWithError(contacts, err));
  }

  onPullError(error, ...contactIds) {
    logger.error(`Contact ids=${contactIds} pull error: ${error}`);
    return error;
  }

  onContactsWithError(contactsWithError, commonError = null) {
    if (contactsWithError && contactsWithError.length) {
      if (commonError) {
        const ids = contactsWithError.map(c => c.id);
        this.onPullError(commonError, ids);
      } else {
        contactsWithError.forEach(c => logger.error(`Contact id=${c.id} pull error: ${c.error}`));
      }
    }
  }

}
