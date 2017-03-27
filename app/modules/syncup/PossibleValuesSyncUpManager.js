import { POSSIBLE_VALUES_PER_FIELD_PATHS } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import PossibleValuesHelper from '../helpers/PossibleValuesHelper';

/**
 * Activity possible values Sync Up Manager
 * @author Nadejda Mandrescu
 */
const PossibleValuesSyncUpManager = {

  syncUp(fieldPaths) {
    return new Promise((resolve, reject) =>
      ConnectionHelper.doPost({ url: POSSIBLE_VALUES_PER_FIELD_PATHS, body: fieldPaths, shouldRetry: true })
        .then(possibleValuesCollection => {
          const newPossibleValues = [];
          Object.entries(possibleValuesCollection).forEach(entry =>
            newPossibleValues.push(PossibleValuesHelper.transformToClientUsage(entry)));
          return PossibleValuesHelper.saveOrUpdateCollection(newPossibleValues);
        }).then(resolve).catch(reject));
  }

};

export default PossibleValuesSyncUpManager;
