import * as MC from '../../../utils/constants/MigrationsConstants';
import * as Utils from '../../../utils/Utils';
import PreCondition from './PreCondition';
import ChangesetHelper from '../../helpers/ChangesetHelper';

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

  /**
   * @return {Array<string>}
   */
  get context() {
    return this._changeset[MC.CONTEXT];
  }

  set execContext(context) {
    this._execContext = context;
  }

  get execContext() {
    return this._execContext;
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
      this._change = Changeset._getFuncOrUpdate(this._origChangeset[MC.CHANGES]);
    }
    return this._change;
  }

  static _getFuncOrUpdate(funcOrUpdateDef) {
    if (funcOrUpdateDef) {
      if (funcOrUpdateDef[MC.FUNC]) {
        return funcOrUpdateDef[MC.FUNC];
      }
      if (funcOrUpdateDef[MC.UPDATE]) {
        return ChangesetHelper.getUpdateFunc.bind(null, funcOrUpdateDef[MC.UPDATE]);
      }
    }
    return null;
  }

  /**
   * The optional rollback function to execute if the change method fails.
   * You can define a custom sync or async function identified with 'func' or define an 'update' command.
   * @return {function|Promise} the 'func' or 'update' function reference
   */
  get rollback() {
    if (this._rollback === undefined) {
      this._rollback = Changeset._getFuncOrUpdate(this._origChangeset[MC.ROLLBACK]);
    }
    return this._rollback;
  }

  /**
   * @return {Array<PreCondition>}
   */
  get preConditions() {
    return this._changeset[MC.PRECONDITIONS];
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

  set orderExecuted(orderExecuted) {
    this._orderExecuted = orderExecuted;
  }

  /**
   * @return {Number} the execution order (starting from 1) per changeset deployment id
   */
  get orderExecuted() {
    return this._orderExecuted;
  }

  set execType(execType) {
    this._execType = execType;
  }

  /**
   * @return {String} see EXECTYPE_XXX constants
   */
  get execType() {
    return this._execType;
  }

  set dateFound(dateFound) {
    this._dateFound = dateFound;
  }

  get dateFound() {
    return this._dateFound;
  }

  set dateExecuted(dateExecuted) {
    this._dateExecuted = dateExecuted;
  }

  get dateExecuted() {
    return this._dateExecuted;
  }

  set error(error) {
    this._error = error;
  }

  /**
   * @return {String}
   */
  get error() {
    return this._error;
  }

  set rollbackExecType(rollbackExecType) {
    this._rollbackExecType = rollbackExecType;
  }

  /**
   * @return {String} see EXECTYPE_XXX constants
   */
  get rollbackExecType() {
    return this._rollbackExecType;
  }

  set rollbackError(rollbackError) {
    this._rollbackError = rollbackError;
  }

  /**
   * @return {String}
   */
  get rollbackError() {
    return this._rollbackError;
  }

  /**
   * @param prevDBData the existing DB record
   */
  set prevDBData(prevDBData: Object) {
    this._prevDBData = prevDBData;
  }

  /**
   * @return {Object}
   */
  get prevDBData() {
    return this._prevDBData;
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
      const preCs = origChangeset[MC.PRECONDITIONS];
      if (preCs && preCs.length) {
        preCs.forEach(pc => {
          if (pc[MC.FUNC]) {
            pc[MC.FUNC].toJSON = funcToJson;
          }
        });
      }
    }
    return origChangeset;
  }

  static _cloneWithDefaults(origChangeset, changelogDef) {
    const m = Utils.cloneDeep(origChangeset);
    m.id = Changeset.buildId(origChangeset, changelogDef);

    Changeset._setDefaultIfUndefined(m, MC.CONTEXT, MC.DEFAULT_CONTEXT);
    Changeset._setDefaultIfUndefined(m, MC.RUN_ALWAYS, MC.DEFAULT_RUN_ALWAYS);
    Changeset._setDefaultIfUndefined(m, MC.RUN_ON_CHANGE, MC.DEFAULT_RUN_ON_CHANGE);
    Changeset._setDefaultIfUndefined(m, MC.FAIL_ON_ERROR, MC.DEFAULT_FAIL_ON_ERROR);

    m[MC.PRECONDITIONS] = Changeset.setDefaultsForPreconditions(origChangeset[MC.PRECONDITIONS]);

    Changeset._normalize(m);

    return m;
  }

  static buildId(origChangeset, changelogDef) {
    return `${origChangeset[MC.CHANGEID]}-${origChangeset[MC.AUTHOR]}-${changelogDef[MC.FILE]}`;
  }

  static setDefaultsForPreconditions(pcs) {
    if (pcs && pcs.length) {
      pcs.forEach(pc => {
        Changeset._setDefaultIfUndefined(pc, MC.ON_FAIL, MC.DEFAULT_ON_FAIL_ERROR);
        Changeset._setDefaultIfUndefined(pc, MC.ON_ERROR, MC.DEFAULT_ON_FAIL_ERROR);
      });
      pcs = pcs.map(p => new PreCondition(p));
    }
    return pcs;
  }

  static _setDefaultIfUndefined(parent, field, defaultValue) {
    if (parent[field] === undefined) {
      parent[field] = defaultValue;
    }
  }

  static _normalize(changeset) {
    const context = changeset[MC.CONTEXT];
    changeset[MC.CONTEXT] = (context instanceof Array ? context : [context]).map(c => c.toLowerCase());
  }

}
