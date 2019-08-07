import { Constants } from 'amp-ui';
import { throwSyncUpError } from './syncupManagers/SyncUpManagerInterface';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Syncup diff');

/* eslint-disable class-methods-use-this */

/**
 * Sync Up difference storage
 * @author Nadejda Mandrescu
 */
export default class SyncUpDiff {
  constructor(syncUpDiff) {
    this._syncUpDiff = syncUpDiff || {};
  }

  get syncUpDiff() {
    return this._syncUpDiff;
  }

  getSyncUpDiff(type) {
    return this._syncUpDiff[type];
  }

  /**
   * Merge existing sync up difference for the specified type with the new difference
   * @param type
   * @param diff
   */
  merge(type, diff) {
    switch (type) {
      case Constants.SYNCUP_TYPE_TRANSLATIONS:
      case Constants.SYNCUP_TYPE_GS:
      case Constants.SYNCUP_TYPE_WORKSPACES:
      case Constants.SYNCUP_TYPE_WORKSPACE_SETTINGS:
      case Constants.SYNCUP_TYPE_ASSETS:
      case Constants.SYNCUP_TYPE_GAZETTEER:
      case Constants.SYNCUP_TYPE_MAP_TILES:
      case Constants.SYNCUP_TYPE_EXCHANGE_RATES:
      case Constants.SYNCUP_TYPE_ACTIVITY_FIELDS: // TODO update once AMP-25568 is also done, as part of AMPOFFLINE-270
      case Constants.SYNCUP_TYPE_CONTACT_FIELDS:
      case Constants.SYNCUP_TYPE_RESOURCE_FIELDS:
      case Constants.SYNCUP_TYPE_FEATURE_MANAGER:
      case Constants.SYNCUP_TYPE_ACTIVITIES_PUSH:
      case Constants.SYNCUP_TYPE_CONTACTS_PUSH:
      case Constants.SYNCUP_TYPE_RESOURCES_PUSH:
        diff = diff || this._syncUpDiff[type] || [];
        break;
      case Constants.SYNCUP_TYPE_USERS:
      case Constants.SYNCUP_TYPE_WORKSPACE_MEMBERS:
      case Constants.SYNCUP_TYPE_CALENDARS:
      case Constants.SYNCUP_TYPE_ACTIVITIES_PULL:
      case Constants.SYNCUP_TYPE_CONTACTS_PULL:
      case Constants.SYNCUP_TYPE_RESOURCES_PULL:
        diff.removed = (this._syncUpDiff[type] ? (this._syncUpDiff[type].removed || []) : []).concat(diff.removed);
        diff.removed = Array.from(new Set(diff.removed)); // get unique entries; keep array as it is expected everywhere
        diff.saved = (this._syncUpDiff[type] ? (this._syncUpDiff[type].saved || []) : []).concat(diff.saved);
        diff.saved = diff.saved.filter(item => !diff.removed.includes(item));
        diff.saved = Array.from(new Set(diff.saved));
        break;
      // a list of elements to sync up
      case Constants.SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES:
      case Constants.SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES:
      case Constants.SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES:
      case Constants.SYNCUP_TYPE_COMMON_POSSIBLE_VALUES:
        diff = Array.from(new Set((this._syncUpDiff[type] || []).concat(diff)));
        break;
      default:
        throwSyncUpError(`SyncUpDiff merge not implemented for type = ${type}`);
    }

    this.setDiff(type, diff);
  }

  setDiff(type, diff) {
    diff = this.constructor._nullifyIfNoDiff(diff);
    if (diff === null) {
      delete this._syncUpDiff[type];
    } else {
      this._syncUpDiff[type] = diff;
    }
  }

  static hasChanges(diff) {
    return !!SyncUpDiff._nullifyIfNoDiff(diff);
  }

  static _nullifyIfNoDiff(diff) {
    if (diff === undefined || diff === false || (diff.length && diff.length === 0)) {
      return null;
    } else if (diff.saved && diff.saved.length === 0 && diff.removed.length === 0) {
      return null;
    } else if (diff instanceof Object && Object.keys(diff).length === 0) {
      return null;
    }
    return diff;
  }

  /**
   * Checks if two diffs, provided by SyncUpDiff, are equal.
   * @param diff1
   * @param diff2
   * @return {boolean}
   */
  static equals(diff1, diff2) {
    // nullify undefined
    diff1 = diff1 === undefined ? null : diff1;
    diff2 = diff2 === undefined ? null : diff2;
    // same objects / nulls
    if (diff1 === diff2) {
      return true;
    }
    // atomic diffs (that are booleans) are different or one of the diffs is null
    if (typeof diff1 === 'boolean' || diff1 === null || diff2 === null) {
      return false;
    }
    // same list of entries
    if (diff1.length !== undefined && diff1.length === diff2.length) {
      return true;
    }
    // removed & saved sets are the same, though one of them may not exist
    if (diff1.removed || diff1.saved) {
      if ((!diff1.removed || (diff2.removed && diff1.removed.length === diff2.removed.length))
        && (!diff1.saved || (diff2.saved && diff1.saved.length === diff2.saved.length))) {
        return true;
      }
      return false;
    }
    logger.error(`Diff check reached unexpected use case: diff1 = "${diff1}", diff2 = "${diff2}". 
    Possibly a bug. Fallback to false.`);
    return false;
  }

}
