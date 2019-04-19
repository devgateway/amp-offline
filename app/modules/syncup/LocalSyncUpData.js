import * as ActivityHelper from '../helpers/ActivityHelper';
import * as UserHelper from '../helpers/UserHelper';
import ActivitiesPushToAMPManager from './syncupManagers/ActivitiesPushToAMPManager';
import ContactHelper from '../helpers/ContactHelper';
import ResourceHelper from '../helpers/ResourceHelper';
import TranslationSyncupManager from './syncupManagers/TranslationSyncUpManager';
import * as FieldsHelper from '../helpers/FieldsHelper';
import {
  SYNCUP_TYPE_ACTIVITY_FIELDS,
  SYNCUP_TYPE_CONTACT_FIELDS,
  SYNCUP_TYPE_RESOURCE_FIELDS
} from '../../utils/Constants';
import PossibleValuesHelper from '../helpers/PossibleValuesHelper';

/**
 * This class is to store local information needed during sync up diff or decisions while running the sync up
 *
 * @author Nadejda Mandrescu
 */
export default class LocalSyncUpData {

  /**
   * Computes local data information for the sync up
   * @returns {Promise<any[] | never>}
   */
  build() {
    return Promise.all([ActivityHelper.getUniqueAmpIdsList(), UserHelper.getNonBannedRegisteredUserIds(),
      ActivitiesPushToAMPManager.getActivitiesToPush(), ContactHelper.findAllContactsModifiedOnClient(),
      ResourceHelper.countAllResourcesModifiedOnClient(), TranslationSyncupManager.getNewTranslationsDifference(),
      FieldsHelper.getSingleFieldsDef(SYNCUP_TYPE_ACTIVITY_FIELDS),
      FieldsHelper.getSingleFieldsDef(SYNCUP_TYPE_CONTACT_FIELDS),
      FieldsHelper.getSingleFieldsDef(SYNCUP_TYPE_RESOURCE_FIELDS),
      PossibleValuesHelper.findActivityPossibleValuesPaths()])
      .then(([
               ampIds, userIds, activitiesToPush, contactsToPush, resourcesToPushCount, newTranslations,
               activityFields, contactFields, resourceFields, activitiesPVsPaths
             ]) => {
        this._ampIds = ampIds;
        this._activitiesPVsPaths = activitiesPVsPaths;
        this._activityFields = activityFields;
        this._contactFields = contactFields;
        this._resourceFields = resourceFields;
        this._registeredUserIds = userIds;
        this._hasActivitiesToPush = activitiesToPush && activitiesToPush.length > 0;
        this._hasContactsToPush = contactsToPush && contactsToPush.length > 0;
        this._hasResourcesToPush = resourcesToPushCount > 0;
        this._hasTranslationsToPush = newTranslations && newTranslations.length > 0;
        return null;
      });
  }

  get ampIds() {
    return this._ampIds;
  }

  get activitiesPVsPaths() {
    return this._activitiesPVsPaths;
  }

  get activityFields() {
    return this._activityFields;
  }

  get contactFields() {
    return this._contactFields;
  }

  get resourceFields() {
    return this._resourceFields;
  }

  get registeredUserIds() {
    return this._registeredUserIds;
  }

  get hasActivitiesToPush() {
    return this._hasActivitiesToPush;
  }

  get hasContactsToPush() {
    return this._hasContactsToPush;
  }

  get hasResourcesToPush() {
    return this._hasResourcesToPush;
  }

  get hasTranslationsToPush() {
    return this._hasTranslationsToPush;
  }

}
