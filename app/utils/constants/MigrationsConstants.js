/** Changelogs definition fields */

export const FILE = 'file';
export const CONTENT = 'content';
export const CHANGELOG = 'changelog';
export const PRECONDITIONS = 'preConditions';
export const CHANGESETS = 'changesets';
export const CHANGEID = 'changeid';
export const AUTHOR = 'author';
export const CONTEXT = 'context';
export const RUN_ALWAYS = 'runAlways';
export const RUN_ON_CHANGE = 'runOnChange';
export const FAIL_ON_ERROR = 'failOnError';
export const COMMENT = 'comment';
export const CHANGES = 'changes';
export const FUNC = 'func';
export const UPDATE = 'update';
export const TABLE = 'table';
export const FIELD = 'field';
export const VALUE = 'value';
export const FILTER = 'filter';
export const ON_FAIL = 'onFail';
export const ON_ERROR = 'onError';
export const ROLLBACK = 'rollback';

export const CONTEXT_STARTUP = 'startup';
export const CONTEXT_INIT = 'init';
export const CONTEXT_ALL = 'all';

export const CONTEXT_OPTIONS = [CONTEXT_STARTUP, CONTEXT_INIT, CONTEXT_ALL];

export const ON_FAIL_ERROR_HALT = 'HALT';
export const ON_FAIL_ERROR_CONTINUE = 'CONTINUE';
export const ON_FAIL_ERROR_MARK_RAN = 'MARK_RAN';
export const ON_FAIL_ERROR_WARN = 'WARN';
export const ON_FAIL_ERROR_CHANGESET_OPTIONS = [ON_FAIL_ERROR_HALT, ON_FAIL_ERROR_CONTINUE, ON_FAIL_ERROR_MARK_RAN,
  ON_FAIL_ERROR_WARN];
export const ON_FAIL_ERROR_CHANGELOG_OPTIONS = [ON_FAIL_ERROR_HALT, ON_FAIL_ERROR_WARN];

export const DEFAULT_CONTEXT = CONTEXT_STARTUP;
export const DEFAULT_RUN_ALWAYS = false;
export const DEFAULT_RUN_ON_CHANGE = false;
export const DEFAULT_FAIL_ON_ERROR = false;
export const DEFAULT_ON_FAIL_ERROR = ON_FAIL_ERROR_HALT;

/** Database extra constants */
export const FILENAME = 'filename';
export const MD5SUM = 'md5sum';
export const DATE_FOUND = 'datefound';
export const DATE_EXECUTED = 'dateexecuted';
export const ORDER_EXECUTED = 'orderexecuted';
export const DEPLOYMENT_ID = 'deploymentid';
export const EXECTYPE = 'exectype';
export const ERROR = 'error';
export const ROLLBACKEXECTYPE = 'rollbackexectype';
export const ROLLBACKERROR = 'rollbackerror';

/** precondition matched and change ran successfully */
export const EXECTYPE_EXECUTED = 'EXECUTED';
/** reran successfully (would happen for runAlways=true); orderexecuted and deploymentid will store the latest one */
export const EXECTYPE_RERUN = 'RERUN';
/** either changeset or changelog level precondition ended with fail */
export const EXECTYPE_PRECONDITION_FAIL = 'PRECONDITION_FAIL';
/** either changeset or changelog level precondition ended with error */
export const EXECTYPE_PRECONDITION_ERROR = 'PRECONDITION_ERROR';
/** the changeset didn’t run (e.g. another changeset precondition failure requested to HALT the entire changelog
 * or another changeset failed with failOnError=true) */
export const EXECTYPE_NOT_RUN = 'NOT_RUN';

/** Other (workflow) constants */
export const EXECTYPE_PRECONDITION_SUCCESS = 'EXECTYPE_PRECONDITION_SUCCESS';
