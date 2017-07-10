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

  addError(error) {
    this._errors.push(error);
  }

  addErrors(errors) {
    this._errors.push(errors);
  }

  get errors() {
    return this._errors;
  }

  set lastSyncUpDate(lastSyncTimestamp) {
    this._lastSyncTimestamp = lastSyncTimestamp;
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
