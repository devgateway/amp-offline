import SyncUpManagerInterface, { throwSyncUpError } from './SyncUpManagerInterface';

/* eslint-disable class-methods-use-this */

/**
 * This class implements default functionality for atomic sync up changes
 * @author Nadejda Mandrescu
 */
export default class AbstractAtomicSyncUpManager extends SyncUpManagerInterface {

  constructor() {
    super();

    if (this.doAtomicSyncUp === undefined) {
      throwSyncUpError('AbstractAtomicSyncUpManager.doAtomicSyncUp not implemented');
    }
    this.done = false;
  }

  doSyncUp(diff) {
    return this.doAtomicSyncUp(diff).then((result) => {
      this.done = true;
      return result;
    });
  }

  getDiffLeftover() {
    return this.diff || this.done !== true;
  }

  cancel() {
  }
}
