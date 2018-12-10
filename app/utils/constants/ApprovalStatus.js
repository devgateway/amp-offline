import * as VC from './ValueConstants';

/**
 * @author Nadejda Mandrescu
 */
class ApprovalStatus {
  static CREATED = new ApprovalStatus(0, VC.CREATED);
  static APPROVED = new ApprovalStatus(1, VC.APPROVED);
  static EDITED = new ApprovalStatus(2, VC.EDITED);
  static STARTED_APPROVED = new ApprovalStatus(3, VC.STARTED_APPROVED);
  static STARTED = new ApprovalStatus(4, VC.STARTED);
  static NOT_APPROVED = new ApprovalStatus(5, VC.NOT_APPROVED);
  static REJECTED = new ApprovalStatus(6, VC.REJECTED);

  constructor(id, value) {
    this._id = id;
    this._value = value;
    this._str = `${value} (${id})`;
    return Object.freeze(this);
  }

  get id() {
    return this._id;
  }

  get value() {
    return this._value;
  }

  toString() {
    return this._str;
  }
}

export default Object.freeze(ApprovalStatus);
