import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import PossibleValuesHelper from '../../helpers/PossibleValuesHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import LoggerManager from '../../util/LoggerManager';

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
    LoggerManager.log('doAtomicSyncUp');
    return ConnectionHelper.doPost({ url: this._url, body: fieldPaths, shouldRetry: true })
      .then(possibleValuesCollection => {
        const newPossibleValues = [];
        Object.entries(possibleValuesCollection).forEach(entry =>
          newPossibleValues.push(PossibleValuesHelper.transformToClientUsage(entry)));
        return PossibleValuesHelper.saveOrUpdateCollection(newPossibleValues);
      }).then((result) => {
        this.done = true;
        return result;
      }).catch(() => {
        this.diff = fieldPaths;
      });
  }
}
