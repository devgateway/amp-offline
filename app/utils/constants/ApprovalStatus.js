import { ValueConstants } from 'amp-ui';

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
  CREATED: new ApprovalStatusEntry(0, ValueConstants.APPROVAL_STATUS_CREATED),
  APPROVED: new ApprovalStatusEntry(1, ValueConstants.APPROVAL_STATUS_APPROVED),
  EDITED: new ApprovalStatusEntry(2, ValueConstants.APPROVAL_STATUS_EDITED),
  STARTED_APPROVED: new ApprovalStatusEntry(3, ValueConstants.APPROVAL_STATUS_STARTED_APPROVED),
  STARTED: new ApprovalStatusEntry(4, ValueConstants.APPROVAL_STATUS_STARTED),
  NOT_APPROVED: new ApprovalStatusEntry(5, ValueConstants.APPROVAL_STATUS_NOT_APPROVED),
  REJECTED: new ApprovalStatusEntry(6, ValueConstants.APPROVAL_STATUS_REJECTED)
});

export default ApprovalStatus;

export const ALL_APPROVAL_STATUSES = [ApprovalStatus.CREATED, ApprovalStatus.APPROVED, ApprovalStatus.EDITED,
  ApprovalStatus.STARTED_APPROVED, ApprovalStatus.STARTED, ApprovalStatus.NOT_APPROVED, ApprovalStatus.REJECTED];
