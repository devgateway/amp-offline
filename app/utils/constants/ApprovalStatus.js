import * as VC from './ValueConstants';

/**
 * @author Nadejda Mandrescu
 */
class ApprovalStatusEntry {

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

const ApprovalStatus = Object.freeze({
  CREATED: new ApprovalStatusEntry(0, VC.CREATED),
  APPROVED: new ApprovalStatusEntry(1, VC.APPROVED),
  EDITED: new ApprovalStatusEntry(2, VC.EDITED),
  STARTED_APPROVED: new ApprovalStatusEntry(3, VC.STARTED_APPROVED),
  STARTED: new ApprovalStatusEntry(4, VC.STARTED),
  NOT_APPROVED: new ApprovalStatusEntry(5, VC.NOT_APPROVED),
  REJECTED: new ApprovalStatusEntry(6, VC.REJECTED)
});

export default ApprovalStatus;
