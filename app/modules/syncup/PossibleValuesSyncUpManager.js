import { POSSIBLE_VALUES_PER_FIELD_PATHS } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import * as PossibleValuesHelper from '../helpers/PossibleValuesHelper';

/**
 * Activity possible values Sync Up Manager
 * @author Nadejda Mandrescu
 */
export default class PossibleValuesSyncUpManager {
  constructor(fieldPaths) {
    this._fieldPaths = fieldPaths;
  }

  syncUp() {
    const body = { 'field-paths': this._fieldPaths };
    return ConnectionHelper.doPost({ url: POSSIBLE_VALUES_PER_FIELD_PATHS, body, shouldRetry: true })
      .then(possibleValuesCollection => {
        const newPossibleValues = [];
        Object.entries(possibleValuesCollection).forEach(([key, value]) =>
          newPossibleValues.push({ id: key, fields: value })
        );
        return PossibleValuesHelper.saveOrUpdateCollection(newPossibleValues);
      });
  }

}
