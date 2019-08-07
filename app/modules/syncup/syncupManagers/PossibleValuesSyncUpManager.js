import { Constants } from 'amp-ui';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import PossibleValuesHelper from '../../helpers/PossibleValuesHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Logger from '../../util/LoggerManager';
import {
  PREFIX_ACTIVITY,
  PREFIX_COMMON,
  PREFIX_CONTACT,
  PREFIX_RESOURCE
} from '../../../utils/constants/FieldPathConstants';

const logger = new Logger('Possible values syncup manager');

/* eslint-disable class-methods-use-this */

const SYNCUP_TYPE_TO_PREFIX = {
  [Constants.SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES]: PREFIX_ACTIVITY,
  [Constants.SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES]: PREFIX_CONTACT,
  [Constants.SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES]: PREFIX_RESOURCE,
  [Constants.SYNCUP_TYPE_COMMON_POSSIBLE_VALUES]: PREFIX_COMMON,
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
