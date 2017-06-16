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
  SYNCUP_TYPE_ACTIVITIES_PULL,
  SYNCUP_TYPE_ACTIVITIES_PUSH,
  SYNCUP_TYPE_ASSETS,
  SYNCUP_TYPE_EXCHANGE_RATES,
  SYNCUP_TYPE_FIELDS,
  SYNCUP_TYPE_GS,
  SYNCUP_TYPE_POSSIBLE_VALUES,
  SYNCUP_TYPE_TRANSLATIONS,
  SYNCUP_TYPE_USERS,
  SYNCUP_TYPE_WORKSPACE_MEMBERS,
  SYNCUP_TYPE_WORKSPACE_SETTINGS,
  SYNCUP_TYPE_WORKSPACES
} from '../../utils/Constants';

/**
 * Sync up collection that executes units sync up once all dependencies are met
 * @author Nadejda Mandrescu
 */
export default class SyncUpCollection {

  static _COMMON_DEP = { SYNCUP_TYPE_USERS: SS.STATES_SUCCESS };
  static _COLLECTION = [UsersSyncUpManager, WorkspaceSyncUpManager, WorkspaceSettingsSyncUpManager,
    WorkspaceMemberSyncUpManager, TranslationSyncUpManager, AmpAssetManager, FieldsSyncUpManager,
    PossibleValuesSyncUpManager, ActivitiesPushToAMPManager, ActivitiesPullFromAMPManager,
    GlobalSettingsSyncUpManager, CurrencyRatesSyncUpManager];
  static _COLLECTION_DEPENDENCY = SyncUpCollection._initCollection();

  static _initCollection() {
    const dependencies = {};
    dependencies[SYNCUP_TYPE_USERS] = {};
    dependencies[SYNCUP_TYPE_WORKSPACES] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_WORKSPACE_MEMBERS] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_WORKSPACE_SETTINGS] = {
      ...SyncUpCollection._COMMON_DEP,
      ...Utils.toMap(SYNCUP_TYPE_WORKSPACES, SS.STATES_PARTIAL_SUCCESS)
    };
    dependencies[SYNCUP_TYPE_ASSETS] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_GS] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_TRANSLATIONS] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_FIELDS] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_POSSIBLE_VALUES] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_ACTIVITIES_PUSH] = SyncUpCollection._COMMON_DEP;
    dependencies[SYNCUP_TYPE_ACTIVITIES_PULL] = {
      ...SyncUpCollection._COMMON_DEP,
      ...Utils.toMap(SYNCUP_TYPE_ACTIVITIES_PUSH, SS.STATES_FINISH)
    };
    dependencies[SYNCUP_TYPE_EXCHANGE_RATES] = SyncUpCollection._COMMON_DEP;
  }

  constructor() {
    this._initDependencies();
    this._changes = {};
  }

  _initDependencies() {
    this._syncUpDependency = new SyncUpDependency();
    this._syncUpCollection = {};
    this._COLLECTION.forEach((SyncUpClass: SyncUpManagerInterface) => {
      const syncUpUnit = new SyncUpClass();
      this._syncUpCollection[syncUpUnit.type] = syncUpUnit;
      Object.entries(this._COLLECTION_DEPENDENCY[syncUpUnit.type]).forEach(([depType, depStates]) =>
        this._syncUpDependency.add(syncUpUnit.type, depType, depStates));
    });
  }

  addChanges(type, changes) {
    this._changes[type] = changes;
  }
}
