import { HIERARCHICAL_VALUE, HIERARCHICAL_VALUE_DEPTH } from '../../../../utils/constants/ActivityConstants';
import PossibleValuesManager from '../../../../modules/field/PossibleValuesManager';

/* eslint-disable class-methods-use-this */

/**
 * A simple option
 * @author Nadejda Mandrescu
 */
export default class AFOption {
  constructor({ id, value, displayHierarchicalValue, ...extraInfo }) {
    this._id = id;
    this._value = value;
    this._displayHierarchicalValue = displayHierarchicalValue;
    if (extraInfo) {
      Object.assign(this, extraInfo);
    }
  }

  get isAFOption() {
    return true;
  }

  get id() {
    return this._id;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  get translatedValue() {
    return PossibleValuesManager.getOptionTranslation(this);
  }

  get hierarchicalValue() {
    return this[HIERARCHICAL_VALUE];
  }

  get displayHierarchicalValue() {
    return this._displayHierarchicalValue;
  }

  get displayValue() {
    if (this._displayHierarchicalValue) {
      return this.hierarchicalValue;
    }
    return this.translatedValue;
  }

  get displayFullValue() {
    return this.hierarchicalValue || this.translatedValue;
  }

  get hierarchicalDepth() {
    return this[HIERARCHICAL_VALUE_DEPTH];
  }

}
