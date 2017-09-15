import BatchPullSyncUpManagerInterface from './BatchPullSyncUpManagerInterface';
import LoggerManager from '../../util/LoggerManager';
import DateUtils from '../../../utils/DateUtils';
import { throwSyncUpError } from './SyncUpManagerInterface';

/**
 * An extension for Batch Pull for units with sync diff defined as { saved , removed } entries
 * @author Nadejda Mandrescu
 */
export default class BatchPullSavedAndRemovedSyncUpManager extends BatchPullSyncUpManagerInterface {
  constructor(...args) {
    super(...args);
    if (this.removeEntries === undefined) {
      throwSyncUpError('BatchPullSavedAndRemovedSyncUpManager.removeEntries not implemented');
    }
    if (this.pullNewEntries === undefined) {
      throwSyncUpError('BatchPullSavedAndRemovedSyncUpManager.pullNewEntries not implemented');
    }
  }

  /**
   * Pulls saved entries from AMP by adding/updating them to the client DB
   * @param saved the entries saved as new or update on AMP
   * @param removed deleted entries on AMP
   * Sample of parameters from the sync diff EP:
   * {
   *  "activities": {
   *    "saved" : [ampId1, ...],
   *    "removed" : [ampId2, ...]
   *  },
   *  ...
   * }
   * @return {Promise}
   */
  doSyncUp({ saved, removed }) {
    this.diff = { saved, removed };
    this.pulled = new Set();
    this.syncStartedAt = new Date();
    return this.pullInBatches();
  }

  getDiffLeftover() {
    if (this.syncStartedAt) {
      const duration = DateUtils.duration(this.syncStartedAt, new Date());
      LoggerManager.log(`${this.type} pull duration = ${duration}`);
      LoggerManager.log(`saved = ${this.diff.saved.length}, removed = ${this.diff.removed.length}`);
      this.diff.saved = this.diff.saved.filter(entry => !this.pulled.has(entry));
      LoggerManager.log(`unsynced = ${this.diff.saved.length}`);
    }
    return this.diff;
  }

  pullStart() {
    LoggerManager.log(`pull ${this.type}`);
    return Promise.all([this.removeEntries(), this.pullNewEntries()]);
  }
}
