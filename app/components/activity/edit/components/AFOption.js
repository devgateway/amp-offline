import { HIERARCHICAL_VALUE, HIERARCHICAL_VALUE_DEPTH } from '../../../../utils/constants/ActivityConstants';

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

  get value() {
    return this._value;
  }

  get hierarchicalValue() {
    return this[HIERARCHICAL_VALUE];
  }

  get hierarchicalDepth() {
    return this[HIERARCHICAL_VALUE_DEPTH];
  }

}
