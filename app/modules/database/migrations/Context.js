import Changeset from './Changeset';
import * as MC from '../../../utils/constants/MigrationsConstants';
import * as Utils from '../../../utils/Utils';

/**
 * Migrations context helper
 *
 * @author Nadejda Mandrescu
 */
export default class Context {
  constructor() {
    this._pendingContexts = new Set(MC.CONTEXT_BY_ORDER);
    Utils.selfBindMethods(this);
  }

  set context(context) {
    this._context = context;
    this._pendingContexts.delete(context);
  }

  get context() {
    return this._context;
  }

  /**
   * Checks if the changeset matches for current context execution
   * @param c the changeset
   * @return {boolean}
   */
  matches(c: Changeset) {
    return c.context.includes(this.context) || c.context.includes(MC.CONTEXT_ALL);
  }

  /**
   * Checks if the changeset can still run now or later
   * @param c the changeset
   * @return {boolean|*}
   */
  canRunNowOrLater(c: Changeset) {
    return this.matches(c) || c.context.some(ctx => this._pendingContexts.has(ctx));
  }

}
