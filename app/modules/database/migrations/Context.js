import Changeset from './Changeset';
import * as MC from '../../../utils/constants/MigrationsConstants';

/**
 * Migrations context helper
 *
 * @author Nadejda Mandrescu
 */
export default class Context {
  constructor() {
    this._pendingContext = new Set(MC.CONTEXT_BY_ORDER);
  }

  set context(context) {
    this._context = context;
    this._pendingContext.delete(context);
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

}
