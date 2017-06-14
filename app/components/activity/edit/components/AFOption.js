import { HIERARCHICAL_VALUE, HIERARCHICAL_VALUE_DEPTH } from '../../../../utils/constants/ActivityConstants';
import PossibleValuesManager from '../../../../modules/activity/PossibleValuesManager';

/**
 * A simple option
 * @author Nadejda Mandrescu
 */
export default class AFOption {
  constructor({ id, value, ...extraInfo }) {
    this._id = id;
    this._value = value;
    if (extraInfo) {
      Object.assign(this, extraInfo);
    }
  }

  get id() {
    return this._id;
  }

  get translatedValue() {
    return PossibleValuesManager.getOptionTranslation(this);
  }

  get hierarchicalValue() {
    return this[HIERARCHICAL_VALUE];
  }

  get hierarchicalDepth() {
    return this[HIERARCHICAL_VALUE_DEPTH];
  }

}
