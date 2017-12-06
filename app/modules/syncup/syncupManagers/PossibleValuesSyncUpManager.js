import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import PossibleValuesHelper from '../../helpers/PossibleValuesHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Possible values syncup manager');

/* eslint-disable class-methods-use-this */

/**
 * Activity possible values Sync Up Manager
 * @author Nadejda Mandrescu
 */
export default class PossibleValuesSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor(possibleValuesType, url) {
    super(possibleValuesType);
    this._url = url;
    this.diff = [];
  }

  doAtomicSyncUp(fieldPaths) {
    logger.log('doAtomicSyncUp');
    return ConnectionHelper.doPost({ url: this._url, body: fieldPaths, shouldRetry: true })
      .then(possibleValuesCollection => {
        const newPossibleValues = this.preparePossibleValues(possibleValuesCollection);
        return PossibleValuesHelper.saveOrUpdateCollection(newPossibleValues);
      }).then((result) => {
        this.done = true;
        return result;
      }).catch(() => {
        this.diff = fieldPaths;
      });
  }

  preparePossibleValues(possibleValuesCollection) {
    return Object.entries(possibleValuesCollection).map(entry => PossibleValuesHelper.transformToClientUsage(entry));
  }
}
