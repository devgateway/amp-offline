import * as MC from '../../../utils/constants/MigrationsConstants';
import * as Utils from '../../../utils/Utils';

/**
 * A simple a way to force function to deliver the source code instead of null
 * @return {string}
 */
function funcToJson() {
  return this.toString();
}


/**
 * Stores changeset definition and provides defaults when some fields are not explicitly configured.
 * It also offers other supporting methods like generating MD5 hash, validation against schema check.
 *
 * @author Nadejda Mandrescu
 */
export default class Changeset {
  constructor(origChangeset, changelogDef) {
    this._origChangeset = Changeset._prepareForToJson(origChangeset);
    this._md5 = Utils.md5(this._origChangeset);
    this._changelogDef = changelogDef;
    this._changeset = Changeset._cloneWithDefaults(origChangeset, changelogDef);
  }

  /**
   * The internal changeset object
   * @return {Object}
   */
  get changesetObject() {
    return this._changeset;
  }

  /**
   * The changeset id build in this format '<changeid>-<author>-<filename>', used for unique DB reference
   * @return {string}
   */
  get id() {
    return this._changeset.id;
  }

  get changeId() {
    return this._changeset[MC.CHANGEID];
  }

  get author() {
    return this._changeset[MC.AUTHOR];
  }

  get filename() {
    return this._changelogDef[MC.FILE];
  }

  get context() {
    return this._changeset[MC.CONTEXT];
  }

  /**
   * Defines if to execute the change set on every run, even if it has been run before
   * @return {boolean}
   */
  get isRunAlways() {
    return this._changeset[MC.RUN_ALWAYS];
  }

  /**
   * Defines if to executes the change the first time it is seen and each time the change set has been changed
   * @return {boolean}
   */
  get isRunOnChange() {
    return this._changeset[MC.RUN_ON_CHANGE];
  }

  /**
   * Defines if should the migration fail if an error occurs while executing the change set
   * @return {boolean}
   */
  get isFailOnError() {
    return this._changeset[MC.FAIL_ON_ERROR];
  }

  /**
   * A description of the change set
   * @return {string}
   */
  get comment() {
    return this._changeset[MC.COMMENT];
  }

  /**
   * The actual change function to execute.
   * You can define a custom sync or async function identified with 'func' or define an 'update' command.
   * @return {function|Promise} the 'func' or 'update' function reference
   */
  get change() {
    if (this._change === undefined) {
      this._change = this._changeset[MC.CHANGES] || null;
      if (this._change) {
        this._change = this._change[MC.FUNC] || this._change[MC.UPDATE] || null;
        // TODO update func generation
      }
    }
    return this._change;
  }

  /**
   * The optional rollback function to execute if the change method fails.
   * You can define a custom sync or async function identified with 'func' or define an 'update' command.
   * @return {function|Promise} the 'func' or 'update' function reference
   */
  get rollback() {
    return this._changeset[MC.ROLLBACK];
  }

  /**
   * The MD5 hash for the exact changeset defined in the changelog (excluding any defaults)
   * @return {*}
   */
  get md5() {
    if (!this._md5) {
      this._md5 = Utils.md5(this._origChangeset);
    }
    return this._md5;
  }

  tmpGetDBMd5() {
    // TODO this method will be gone when we'll read MD5 previousely stored in DB instead
    return this._origChangeset.getMd5();
  }

  toJSON() {
    if (!this._json) {
      this._json = JSON.stringify(this._origChangeset);
    }
    return this._json;
  }

  static _prepareForToJson(origChangeset) {
    if (origChangeset) {
      [MC.CHANGES, MC.ROLLBACK].forEach(field => {
        const funcRef = origChangeset[field] && origChangeset[field][MC.FUNC];
        if (funcRef) {
          funcRef.toJSON = funcToJson;
        }
      });
    }
    return origChangeset;
  }

  static _cloneWithDefaults(origChangeset, changelogDef) {
    const m = Utils.cloneDeep(origChangeset);
    m.id = `${m[MC.CHANGEID]}-${m[MC.AUTHOR]}-${changelogDef[MC.FILE]}`;

    Changeset._setDefaultIfUndefined(m, MC.COMMENT, MC.DEFAULT_CONTEXT);
    Changeset._setDefaultIfUndefined(m, MC.RUN_ALWAYS, MC.DEFAULT_RUN_ALWAYS);
    Changeset._setDefaultIfUndefined(m, MC.RUN_ON_CHANGE, MC.DEFAULT_RUN_ON_CHANGE);
    Changeset._setDefaultIfUndefined(m, MC.FAIL_ON_ERROR, MC.DEFAULT_FAIL_ON_ERROR);

    Changeset.setDefaultsForPreconditions(m[MC.PRECONDITIONS]);

    return m;
  }

  static setDefaultsForPreconditions(pcs) {
    if (pcs && pcs.length) {
      pcs.forEach(pc => {
        Changeset._setDefaultIfUndefined(pc, MC.ON_FAIL, MC.DEFAULT_ON_FAIL_ERROR);
        Changeset._setDefaultIfUndefined(pc, MC.ON_ERROR, MC.DEFAULT_ON_FAIL_ERROR);
      });
    }
  }

  static _setDefaultIfUndefined(parent, field, defaultValue) {
    if (parent[field] === undefined) {
      parent[field] = defaultValue;
    }
  }

}
