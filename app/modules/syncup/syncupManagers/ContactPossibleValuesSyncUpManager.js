import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES } from '../../../utils/Constants';
import { CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';

export default class ContactPossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES, CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }

  preparePossibleValues(possibleValuesCollection) {
    const contactPossibleValues = {};
    Object.entries(possibleValuesCollection).forEach(([key, value]) => {
      const contactKey = `contact~${key}`;
      contactPossibleValues[contactKey] = value;
    });
    return super.preparePossibleValues(contactPossibleValues);
  }
}
