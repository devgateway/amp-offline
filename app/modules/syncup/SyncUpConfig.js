import SyncUpManagerInterface from './syncupManagers/SyncUpManagerInterface';
import UsersSyncUpManager from './syncupManagers/UsersSyncUpManager';
import WorkspaceSyncUpManager from './syncupManagers/WorkspaceSyncUpManager';
import WorkspaceMemberSyncUpManager from './syncupManagers/WorkspaceMemberSyncUpManager';
import WorkspaceSettingsSyncUpManager from './syncupManagers/WorkspaceSettingsSyncUpManager';
import GlobalSettingsSyncUpManager from './syncupManagers/GlobalSettingsSyncUpManager';
import TranslationSyncUpManager from './syncupManagers/TranslationSyncUpManager';
import ActivityPossibleValuesSyncUpManager from './syncupManagers/ActivityPossibleValuesSyncUpManager';
import AmpAssetManager from './syncupManagers/AmpAssetSyncUpManager';
import ActivityFieldsSyncUpManager from './syncupManagers/ActivityFieldsSyncUpManager';
import ActivitiesPullFromAMPManager from './syncupManagers/ActivitiesPullFromAMPManager';
import ActivitiesPushToAMPManager from './syncupManagers/ActivitiesPushToAMPManager';
import ContactsPullSyncUpManager from './syncupManagers/ContactsPullSyncUpManager';
import ContactsPushSyncUpManager from './syncupManagers/ContactsPushSyncUpManager';
import ContactFieldsSyncUpManager from './syncupManagers/ContactFieldsSyncUpManager';
import ContactPossibleValuesSyncUpManager from './syncupManagers/ContactPossibleValuesSyncUpManager';
import CurrencyRatesSyncUpManager from './syncupManagers/CurrencyRatesSyncUpManager';
import FMSyncUpManager from './syncupManagers/FMSyncUpManager';
import SyncUpDependency from './SyncUpDependency';
import * as Utils from '../../utils/Utils';
import * as SS from './SyncUpUnitState';
import {
  SYNCUP_TYPE_ACTIVITIES_PUSH,
  SYNCUP_TYPE_ACTIVITY_FIELDS,
  SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES,
  SYNCUP_TYPE_CONTACT_FIELDS,
  SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES, SYNCUP_TYPE_CONTACTS_PULL, SYNCUP_TYPE_CONTACTS_PUSH,
  SYNCUP_TYPE_USERS,
  SYNCUP_TYPE_WORKSPACE_MEMBERS,
  SYNCUP_TYPE_WORKSPACE_SETTINGS,
  SYNCUP_TYPE_WORKSPACES
} from '../../utils/Constants';

/**
 * Sync up configuration for units to sync and dependency rules
 * @author Nadejda Mandrescu
 */
export default class SyncUpConfig {

  static _COLLECTION = [UsersSyncUpManager, WorkspaceSyncUpManager, WorkspaceSettingsSyncUpManager,
    WorkspaceMemberSyncUpManager, TranslationSyncUpManager, AmpAssetManager, ActivityFieldsSyncUpManager,
    ActivityPossibleValuesSyncUpManager, ActivitiesPushToAMPManager, ActivitiesPullFromAMPManager,
    ContactFieldsSyncUpManager, ContactPossibleValuesSyncUpManager, ContactsPullSyncUpManager,
    ContactsPushSyncUpManager,
    GlobalSettingsSyncUpManager, CurrencyRatesSyncUpManager, FMSyncUpManager];
  static _COLLECTION_DEPENDENCY = SyncUpConfig._initCollection();

  static _initCollection() {
    const dependencies = {};
    // Note: current user won't be even able to start the sync if he/she has no right
    dependencies[SYNCUP_TYPE_WORKSPACE_SETTINGS] = Utils.toMap(SYNCUP_TYPE_WORKSPACES, SS.STATES_PARTIAL_SUCCESS);
    dependencies[SYNCUP_TYPE_ACTIVITIES_PUSH] = Utils.toMap(SYNCUP_TYPE_USERS, SS.STATES_SUCCESS);
    /*
    We need the latest TMs before we push activities. Even if TMs sync will fail, we should still push the activities to
    ensure we have as much data synced as possible, since not all activities to push may be affected by TM changes.
    With AMPOFFLINE-908 we'll try to detect even more accurately the activities to push, but nevertheless
    we'll likely continue to use STATES_FINISH if we still want to push asap. API will reject activities as needed.
     */
    dependencies[SYNCUP_TYPE_ACTIVITIES_PUSH][SYNCUP_TYPE_WORKSPACE_MEMBERS] = SS.STATES_FINISH;
    /*
    We need to push contacts before activities, so that new contacts are registered on AMP and links in activities
    are updated to the AMP ids. We don't need it to finish successfully, since we may have such contacts in just a few
    activities or not at all. We will fail only dependent activities if their new contact push doesn't work.
     */
    dependencies[SYNCUP_TYPE_ACTIVITIES_PUSH][SYNCUP_TYPE_CONTACTS_PUSH] = SS.STATES_FINISH;
    // we need to pull contacts before activities push, to unlink deleted contacts from activities
    dependencies[SYNCUP_TYPE_ACTIVITIES_PUSH][SYNCUP_TYPE_CONTACTS_PULL] = SS.STATES_FINISH;
    // fields & possible values dependencies will be needed in the future when permissions/ws based FM are used
    dependencies[SYNCUP_TYPE_ACTIVITY_FIELDS] = Utils.toMap(SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    dependencies[SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES] =
      Utils.toMap(SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    dependencies[SYNCUP_TYPE_CONTACT_FIELDS] = Utils.toMap(SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    dependencies[SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES] =
      Utils.toMap(SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    return dependencies;
  }

  constructor() {
    this._initDependencies();
  }

  _initDependencies() {
    this._syncUpDependency = new SyncUpDependency();
    this._syncUpCollection = new Map();
    SyncUpConfig._COLLECTION.forEach((SyncUpClass: SyncUpManagerInterface) => {
      const syncUpManager = new SyncUpClass();
      this._syncUpCollection.set(syncUpManager.type, syncUpManager);
      const dependencies = SyncUpConfig._COLLECTION_DEPENDENCY[syncUpManager.type];
      if (dependencies) {
        Object.entries(dependencies).forEach(([depType, depStates]) =>
          this._syncUpDependency.add(syncUpManager.type, depType, depStates));
      } else {
        this._syncUpDependency.setState(syncUpManager.type, SS.PENDING);
      }
    });
  }

  /**
   * Provides the entire sync up collection object that stores:
   * { type: syncUpManagerObject }
   * @return {Map}
   */
  get syncUpCollection() {
    return this._syncUpCollection;
  }

  /**
   * Provides sync up dependencies storage
   * @return {SyncUpDependency}
   */
  get syncUpDependencies() {
    return this._syncUpDependency;
  }
}
