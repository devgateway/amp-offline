import { Constants } from 'amp-ui';
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
import ResourcesPullSyncUpManager from './syncupManagers/ResourcesPullSyncUpManager';
import ResourcesPushSyncUpManager from './syncupManagers/ResourcesPushSyncUpManager';
import ResourceFieldsSyncUpManager from './syncupManagers/ResourceFieldsSyncUpManager';
import ResourcePossibleValuesSyncUpManager from './syncupManagers/ResourcePossibleValuesSyncUpManager';
import CommonPossibleValuesSyncUpManager from './syncupManagers/CommonPossibleValuesSyncUpManager';
import CurrencyRatesSyncUpManager from './syncupManagers/CurrencyRatesSyncUpManager';
import FMSyncUpManager from './syncupManagers/FMSyncUpManager';
import SyncUpDependency from './SyncUpDependency';
import MapTilesSyncUpManager from './syncupManagers/MapTilesSyncUpManager';
import GazetteerSyncUpManager from './syncupManagers/GazetteerSyncUpManager';
import CalendarsSyncUpManager from './syncupManagers/CalendarsSyncUpManager';
import * as Utils from '../../utils/Utils';
import * as SS from './SyncUpUnitState';

/**
 * Sync up configuration for units to sync and dependency rules
 * @author Nadejda Mandrescu
 */
export default class SyncUpConfig {

  static _COLLECTION = [UsersSyncUpManager, WorkspaceSyncUpManager, WorkspaceSettingsSyncUpManager,
    WorkspaceMemberSyncUpManager, TranslationSyncUpManager, AmpAssetManager, ActivityFieldsSyncUpManager,
    ActivitiesPushToAMPManager, ActivitiesPullFromAMPManager,
    ContactFieldsSyncUpManager, ContactPossibleValuesSyncUpManager, ContactsPullSyncUpManager,
    ContactsPushSyncUpManager, ResourcesPullSyncUpManager, ResourcesPushSyncUpManager, ResourceFieldsSyncUpManager,
    ResourcePossibleValuesSyncUpManager, CommonPossibleValuesSyncUpManager,
    GlobalSettingsSyncUpManager, CurrencyRatesSyncUpManager, FMSyncUpManager, MapTilesSyncUpManager,
    GazetteerSyncUpManager, CalendarsSyncUpManager, ActivityPossibleValuesSyncUpManager];
  static _COLLECTION_DEPENDENCY = SyncUpConfig._initCollection();

  static _initCollection() {
    const dependencies = {};
    dependencies[Constants.SYNCUP_TYPE_USERS] = Utils.toMap(Constants.SYNCUP_TYPE_TRANSLATIONS, SS.STATES_FINISH);
    // Note: current user won't be even able to start the sync if he/she has no right
    dependencies[Constants.SYNCUP_TYPE_WORKSPACE_SETTINGS] = Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACES,
      SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_ACTIVITIES_PUSH] = Utils.toMap(Constants.SYNCUP_TYPE_USERS, SS.STATES_SUCCESS);
    /*
    We need the latest TMs before we push activities. Even if TMs sync will fail, we should still push the activities to
    ensure we have as much data synced as possible, since not all activities to push may be affected by TM changes.
    With AMPOFFLINE-908 we'll try to detect even more accurately the activities to push, but nevertheless
    we'll likely continue to use STATES_FINISH if we still want to push asap. API will reject activities as needed.
     */
    dependencies[Constants.SYNCUP_TYPE_ACTIVITIES_PUSH][Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS] = SS.STATES_FINISH;
    /*
    We need to push contacts before activities, so that new contacts are registered on AMP and links in activities
    are updated to the AMP ids. We don't need it to finish successfully, since we may have such contacts in just a few
    activities or not at all. We will fail only dependent activities if their new contact push doesn't work.
     */
    dependencies[Constants.SYNCUP_TYPE_ACTIVITIES_PUSH][Constants.SYNCUP_TYPE_CONTACTS_PUSH] = SS.STATES_FINISH;
    // we need to pull contacts before activities push, to unlink deleted contacts from activities
    dependencies[Constants.SYNCUP_TYPE_ACTIVITIES_PUSH][Constants.SYNCUP_TYPE_CONTACTS_PULL] = SS.STATES_FINISH;
    // we need to pull resources before activities push, to unlink deleted resources from activities
    dependencies[Constants.SYNCUP_TYPE_ACTIVITIES_PUSH][Constants.SYNCUP_TYPE_RESOURCES_PULL] = SS.STATES_FINISH;
    dependencies[Constants.SYNCUP_TYPE_ACTIVITIES_PUSH][Constants.SYNCUP_TYPE_RESOURCES_PUSH] = SS.STATES_FINISH;
    // push activities before pull to avoid double pull on structural fields changes on non-conflicting activities
    dependencies[Constants.SYNCUP_TYPE_ACTIVITIES_PULL] = Utils.toMap(Constants.SYNCUP_TYPE_ACTIVITIES_PUSH,
      SS.STATES_FINISH);
    // fields & possible values dependencies will be needed in the future when permissions/ws based FM are used
    dependencies[Constants.SYNCUP_TYPE_ACTIVITY_FIELDS] = Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACES,
      SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES] =
      Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_CONTACT_FIELDS] = Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS,
      SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES] =
      Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_RESOURCE_FIELDS] = Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS,
      SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES] =
      Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_MAP_TILES] = Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS,
      SS.STATES_PARTIAL_SUCCESS);
    dependencies[Constants.SYNCUP_TYPE_GAZETTEER] = Utils.toMap(Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS,
      SS.STATES_PARTIAL_SUCCESS);
    return dependencies;
  }

  constructor() {
    this._initDependencies();
    this._initCollections();
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

  _initCollections() {
    const activitiesPushToAMPManager = this._syncUpCollection.get(Constants.SYNCUP_TYPE_ACTIVITIES_PUSH);
    this._syncUpCollection.get(Constants.SYNCUP_TYPE_ACTIVITIES_PULL).activitiesPushToAMPManager =
      activitiesPushToAMPManager;
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
