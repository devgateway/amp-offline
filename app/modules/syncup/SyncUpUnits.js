import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Syncup units');

/**
 * SyncUp units storage
 * @author Nadejda Mandrescu
 */
export default class SyncUpUnits {
  constructor() {
    logger.log('SyncUpUnits');
    this._units = [];
    this._errors = [];
  }

  add(unitSyncUpPromise) {
    this._units.push(unitSyncUpPromise);
  }

  /**
   * Waits for all units sync up promises to fulfill and returns errors list
   */
  wait() {
    return Promise.all(this._units.map(unitPromise => this._waitOne(unitPromise))).then(() => this._errors);
  }

  /**
   * Waits for the unit promise to fulfil and catches any errors within errors list and resolves (no rejection)
   * @param unitPromise
   * @return {Promise}
   * @private
   */
  _waitOne(unitPromise) {
    return new Promise((resolve) => unitPromise.then(resolve).catch((error) => {
      this._errors.push(error);
      return resolve();
    }));
  }
}
