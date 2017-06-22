import SyncUpManagerInterface from './syncupManagers/SyncUpManagerInterface';
import UsersSyncUpManager from './syncupManagers/UsersSyncUpManager';
import WorkspaceSyncUpManager from './syncupManagers/WorkspaceSyncUpManager';
import WorkspaceMemberSyncUpManager from './syncupManagers/WorkspaceMemberSyncUpManager';
import WorkspaceSettingsSyncUpManager from './syncupManagers/WorkspaceSettingsSyncUpManager';
import GlobalSettingsSyncUpManager from './syncupManagers/GlobalSettingsSyncUpManager';
import TranslationSyncUpManager from './syncupManagers/TranslationSyncUpManager';
import FieldsSyncUpManager from './syncupManagers/FieldsSyncUpManager';
import PossibleValuesSyncUpManager from './syncupManagers/PossibleValuesSyncUpManager';
import AmpAssetManager from './syncupManagers/AmpAssetManager';
import ActivitiesPullFromAMPManager from './syncupManagers/ActivitiesPullFromAMPManager';
import ActivitiesPushToAMPManager from './syncupManagers/ActivitiesPushToAMPManager';
import CurrencyRatesSyncUpManager from './syncupManagers/CurrencyRatesSyncUpManager';
import SyncUpDependency from './SyncUpDependency';
import * as Utils from '../../utils/Utils';
import * as SS from './SyncUpUnitState';
import {
  SYNCUP_TYPE_ACTIVITIES_PUSH,
  SYNCUP_TYPE_FIELDS,
  SYNCUP_TYPE_POSSIBLE_VALUES,
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
    WorkspaceMemberSyncUpManager, TranslationSyncUpManager, AmpAssetManager, FieldsSyncUpManager,
    PossibleValuesSyncUpManager, ActivitiesPushToAMPManager, ActivitiesPullFromAMPManager,
    GlobalSettingsSyncUpManager, CurrencyRatesSyncUpManager];
  static _COLLECTION_DEPENDENCY = SyncUpConfig._initCollection();

  static _initCollection() {
    const dependencies = {};
    // Note: current user won't be even able to start the sync if he/she has no right
    dependencies[SYNCUP_TYPE_WORKSPACE_SETTINGS] = Utils.toMap(SYNCUP_TYPE_WORKSPACES, SS.STATES_PARTIAL_SUCCESS);
    dependencies[SYNCUP_TYPE_ACTIVITIES_PUSH] = Utils.toMap(SYNCUP_TYPE_USERS, SS.STATES_SUCCESS);
    // fields & possible values dependencies will be needed in the future when permissions/ws based FM are used
    dependencies[SYNCUP_TYPE_FIELDS] = Utils.toMap(SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
    dependencies[SYNCUP_TYPE_POSSIBLE_VALUES] = Utils.toMap(SYNCUP_TYPE_WORKSPACE_MEMBERS, SS.STATES_PARTIAL_SUCCESS);
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
