import {
  SYNCUP_TYPE_ACTIVITIES,
  SYNCUP_TYPE_ASSETS,
  SYNCUP_TYPE_FIELDS,
  SYNCUP_TYPE_GS,
  SYNCUP_TYPE_POSSIBLE_VALUES,
  SYNCUP_TYPE_TRANSLATIONS,
  SYNCUP_TYPE_USERS,
  SYNCUP_TYPE_WORKSPACE_MEMBERS,
  SYNCUP_TYPE_WORKSPACE_SETTINGS,
  SYNCUP_TYPE_WORKSPACES
} from '../../utils/Constants';
import { throwSyncUpError } from './syncupManagers/SyncUpManagerInterface';
import LoggerManager from '../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * Sync Up difference storage
 * @author Nadejda Mandrescu
 */
export default class SyncUpDiff {
  constructor(syncUpDiff) {
    LoggerManager.log('constructor');
    this._syncUpDiff = syncUpDiff || {};
  }

  get syncUpDiff() {
    return this._syncUpDiff;
  }

  /**
   * Merge existing sync up difference for the specified type with the new difference
   * @param type
   * @param diff
   */
  merge(type, diff) {
    switch (type) {
      case SYNCUP_TYPE_TRANSLATIONS:
      case SYNCUP_TYPE_GS:
      case SYNCUP_TYPE_WORKSPACES:
      case SYNCUP_TYPE_WORKSPACE_SETTINGS:
      case SYNCUP_TYPE_ASSETS:
      case SYNCUP_TYPE_FIELDS: // TODO update once AMP-25568 is also done, as part of AMPOFFLINE-270
        diff = diff || this._syncUpDiff[type];
        break;
      case SYNCUP_TYPE_USERS:
      case SYNCUP_TYPE_WORKSPACE_MEMBERS:
      case SYNCUP_TYPE_ACTIVITIES:
        diff.removed = (this._syncUpDiff[type] ? (this._syncUpDiff[type].removed || []) : []).concat(diff.removed);
        diff.saved = (this._syncUpDiff[type] ? (this._syncUpDiff[type].saved || []) : []).concat(diff.saved);
        break;
      // a list of elements to sync up
      case SYNCUP_TYPE_POSSIBLE_VALUES:
        diff = (this._syncUpDiff[type] || []).concat(diff);
        break;
      default:
        throwSyncUpError(`SyncUpDiff merge not implemented for type = ${type}`);
    }

    this.setDiff(type, diff);
  }

  setDiff(type, diff) {
    diff = this._nullifyIfNoDiff(diff);
    if (diff === null) {
      delete this._syncUpDiff[type];
    } else {
      this._syncUpDiff[type] = diff;
    }
  }

  _nullifyIfNoDiff(diff) {
    if (diff === undefined || diff === false || (diff.length && diff.length === 0)) {
      return null;
    } else if ((diff.saved && diff.saved.length === 0 && diff.removed.length === 0 &&
      (!diff.toPush || diff.toPush.length === 0))) {
      return null;
    } else if (diff instanceof Object && Object.keys(diff).length === 0) {
      return null;
    }
    return diff;
  }

}
