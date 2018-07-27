import Notification from '../../helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_API_SYNCUP } from '../../../utils/constants/ErrorConstants';

/* eslint-disable class-methods-use-this */

/**
 * Interface to implement to integrate into sync up process
 * @author Nadejda Mandrescu
 */
export default class SyncUpManagerInterface {

  constructor(type) {
    this._type = type;
    this.done = false;
    this._errors = [];
    this._warnings = [];
    this._details = {};
    if (this.doSyncUp === undefined) {
      throwSyncUpError('SyncUpManagerInterface.doSyncUp not implemented');
    }
    if (this.getDiffLeftover === undefined) {
      throwSyncUpError('SyncUpManagerInterface.getDiffLeftover not implemented');
    }
    if (this.cancel === undefined) {
      throwSyncUpError('SyncUpManagerInterface.cancel not implemented');
    }
  }

  get type() {
    return this._type;
  }

  set totalSyncUpDiff(totalSyncUpDiff) {
    this._totalSyncUpDiff = totalSyncUpDiff;
  }

  get totalSyncUpDiff() {
    return this._totalSyncUpDiff;
  }

  addError(error) {
    this._errors.push(error);
  }

  addErrors(errors) {
    this._errors.push(errors);
  }

  /**
   * @return {Array}
   */
  get errors() {
    return this._errors;
  }

  addWarning(warning) {
    this._warnings.push(warning);
  }

  get warnings() {
    return this._warnings;
  }

  set lastSyncUpDate(lastSyncTimestamp) {
    this._lastSyncTimestamp = lastSyncTimestamp;
  }

  get details() {
    return this._details;
  }

  /**
   * Merge sync unit details with another details and provide the merge result. The sync up unit details will not
   * be replaces by the merge result.
   *
   * This must be implemented by each unit that intends to provide the details or a notification error will be raised.
   *
   * @param previousDetails details from a previous run
   * @return {{}}
   */
  mergeDetails(previousDetails) { // eslint-disable-line
    throwSyncUpError('SyncUpManagerInterface.mergeDetails not implemented');
  }

  /**
   * The main sync up processing for the current sync up difference
   * @param diff the current
   */
  // doSyncUp(diff) {}

  /**
   * Must return the unprocessed difference in case an error or interruption occurred
   */
  // getDiffLeftover() {}

  /**
   * Must allow to cancel the processing. This is mostly for the sync up of multiple subelements (like activities).
   *
   * For atomic sync ups (like GS) you may add interruptions if you expect that its sync up setup requires more time
   * (usually with multiple promises). Otherwise for atomic sync ups you can ignore the singal.
   */
  // cancel() {}

}

export const throwSyncUpError = (message) => {
  throw new Notification({
    errorObject: {
      message,
      origin: NOTIFICATION_ORIGIN_API_SYNCUP
    }
  });
};
