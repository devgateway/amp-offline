import { POSSIBLE_VALUES_PER_FIELD_PATHS } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import * as PossibleValuesHelper from '../helpers/PossibleValuesHelper';

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
            newPossibleValues.push(PossibleValuesSyncUpManager.transformToClientUsage(entry))
          );
          return PossibleValuesHelper.saveOrUpdateCollection(newPossibleValues);
        }).then(resolve).catch(reject));
  },

  transformToClientUsage([fieldPath, possibleOptions]) {
    // TODO do recursive when AMP EP will provide the parent-child relationship by having the fields in a tree
    const fieldPathParts = fieldPath.split('~');
    const possibleOptionsMap = {};
    possibleOptions.forEach(option => { possibleOptionsMap[option.id] = option; });
    const possibleValuesForLocalUsage = {
      id: fieldPath,
      'field-path': fieldPathParts,
      'possible-options': possibleOptionsMap
    };
    return possibleValuesForLocalUsage;
  }

};

export default PossibleValuesSyncUpManager;
