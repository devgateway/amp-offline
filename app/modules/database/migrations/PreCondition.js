import * as MC from '../../../utils/constants/MigrationsConstants';

/**
 * A simple precondition wrapper
 *
 * @author Nadejda Mandrescu
 */
export default class PreCondition {
  constructor(precondition) {
    this._precondition = precondition;
  }

  set status(status) {
    this._status = status;
  }

  get status() {
    return this._status;
  }

  get func() {
    return this._precondition[MC.FUNC];
  }

  get changeId() {
    return this._precondition[MC.CHANGEID];
  }

  get author() {
    return this._precondition[MC.AUTHOR];
  }

  get file() {
    return this._precondition[MC.FILE];
  }
}
