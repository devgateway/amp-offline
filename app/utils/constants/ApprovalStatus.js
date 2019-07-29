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
  CREATED: new ApprovalStatusEntry(0, VC.APPROVAL_STATUS_CREATED),
  APPROVED: new ApprovalStatusEntry(1, VC.APPROVAL_STATUS_APPROVED),
  EDITED: new ApprovalStatusEntry(2, VC.APPROVAL_STATUS_EDITED),
  STARTED_APPROVED: new ApprovalStatusEntry(3, VC.APPROVAL_STATUS_STARTED_APPROVED),
  STARTED: new ApprovalStatusEntry(4, VC.APPROVAL_STATUS_STARTED),
  NOT_APPROVED: new ApprovalStatusEntry(5, VC.APPROVAL_STATUS_NOT_APPROVED),
  REJECTED: new ApprovalStatusEntry(6, VC.APPROVAL_STATUS_REJECTED)
});

export default ApprovalStatus;

export const ALL_APPROVAL_STATUSES = [ApprovalStatus.CREATED, ApprovalStatus.APPROVED, ApprovalStatus.EDITED,
  ApprovalStatus.STARTED_APPROVED, ApprovalStatus.STARTED, ApprovalStatus.NOT_APPROVED, ApprovalStatus.REJECTED];
