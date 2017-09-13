import ContactHelper from '../../helpers/ContactHelper';
import { SYNCUP_TYPE_CONTACTS_PULL } from '../../../utils/Constants';
import { CONTACT_PULL_URL } from '../../connectivity/AmpApiConstants';
import BatchPullSavedAndRemovedSyncUpManager from './BatchPullSavedAndRemovedSyncUpManager';
import LoggerManager from '../../util/LoggerManager';
import { ACTIVITY_CONTACT_PATHS } from '../../../utils/constants/FieldPathConstants';
import { CONTACT } from '../../../utils/constants/ActivityConstants';
import * as Utils from '../../../utils/Utils';
import * as ActivityHelper from '../../helpers/ActivityHelper';

/* eslint-disable class-methods-use-this */

/**
 * Pulls the latest contacts data from AMP
 * @author Nadejda Mandrescu
 */
export default class ContactsPullSyncUpManager extends BatchPullSavedAndRemovedSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_CONTACTS_PULL);
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
    const matchContact = Utils.toMap(CONTACT, { $in: removedContactIds });
    const queries = ACTIVITY_CONTACT_PATHS.map(type => Utils.toMap(type, { $elemMatch: matchContact }));
    const filter = { $or: queries };
    // TODO: check if AMP reports activity as modified if a contact is removed, until then remove from all local
    return ActivityHelper.findAllNonRejected(filter).then(activities => {
      activities.forEach(activity => this.unlinkRemovedContactsFromActivity(activity, removedContactIds));
      return ActivityHelper.saveOrUpdateCollection(activities);
    });
  }

  unlinkRemovedContactsFromActivity(activity, removedContactIds) {
    ACTIVITY_CONTACT_PATHS.forEach(contactType => {
      let contacts = activity[contactType];
      if (contacts && contacts.length) {
        contacts = contacts.filter(contact => !removedContactIds.includes(contact[CONTACT]));
        activity[contactType] = contacts;
      }
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
    LoggerManager.error(`Contact id=${contactId} pull error: ${error}`);
    return error;
  }

}
