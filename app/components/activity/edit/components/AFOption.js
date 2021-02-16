import { ActivityConstants, PossibleValuesManager, UIUtils } from 'amp-ui';

/* eslint-disable class-methods-use-this */

/**
 * A simple option
 * @author Nadejda Mandrescu
 */
export default class AFOption {
  constructor({ id, value, displayHierarchicalValue, ...extraInfo }) {
    if (extraInfo) {
      Object.assign(this, extraInfo);
    }
    if (id !== undefined) {
      this._id = id;
    }
    if (value !== undefined) {
      this._value = value;
    }
    if (displayHierarchicalValue !== undefined) {
      this._displayHierarchicalValue = displayHierarchicalValue;
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
    return this[ActivityConstants.HIERARCHICAL_VALUE];
  }

  get displayHierarchicalValue() {
    return this._displayHierarchicalValue;
  }

  get displayValue() {
    let valueToDisplay = this.formattedValue;
    if (!valueToDisplay && this._displayHierarchicalValue) {
      valueToDisplay = this.hierarchicalValue;
    }
    return valueToDisplay || this.translatedValue;
  }

  get displayFullValue() {
    return this.formattedValue || this.hierarchicalValue || this.translatedValue;
  }

  get hierarchicalDepth() {
    return this[ActivityConstants.HIERARCHICAL_VALUE_DEPTH];
  }

  get formattedValue() {
    if (this._valueFormatter) {
      return this._valueFormatter(this);
    }
    return null;
  }

  set valueFormatter(valueFormatter) {
    this._valueFormatter = valueFormatter;
  }

  compareByDisplayValue(other: AFOption) {
    return UIUtils.sortByLocalCompare(this.displayValue, other.displayValue);
  }

  static sortByDisplayValue(afOptions) {
    if (afOptions && afOptions.length) {
      afOptions.sort((o1, o2) => o1.compareByDisplayValue(o2));
    }
    return afOptions;
  }

}
