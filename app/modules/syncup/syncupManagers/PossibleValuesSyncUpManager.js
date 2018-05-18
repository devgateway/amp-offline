import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import PossibleValuesHelper from '../../helpers/PossibleValuesHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Logger from '../../util/LoggerManager';
import { PREFIX_ACTIVITY, PREFIX_CONTACT } from '../../../utils/constants/FieldPathConstants';
import { SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES, SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES } from '../../../utils/Constants';

const logger = new Logger('Possible values syncup manager');

/* eslint-disable class-methods-use-this */

const SYNCUP_TYPE_TO_PREFIX = {
  [SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES]: PREFIX_ACTIVITY,
  [SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES]: PREFIX_CONTACT,
};

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
    const prefix = SYNCUP_TYPE_TO_PREFIX[this._type];
    if (prefix) {
      const prefixedPossibleValues = {};
      Object.entries(possibleValuesCollection).forEach(([key, value]) => {
        const prefixedKey = `${prefix}~${key}`;
        prefixedPossibleValues[prefixedKey] = value;
      });
      possibleValuesCollection = prefixedPossibleValues;
    }
    return Object.entries(possibleValuesCollection).map(entry => PossibleValuesHelper.transformToClientUsage(entry));
  }
}
