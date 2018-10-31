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
export const ON_FAIL_ERROR_OPTIONS = [ON_FAIL_ERROR_HALT, ON_FAIL_ERROR_CONTINUE, ON_FAIL_ERROR_MARK_RAN,
  ON_FAIL_ERROR_WARN];

export const DEFAULT_CONTEXT = CONTEXT_STARTUP;
export const DEFAULT_RUN_ALWAYS = false;
export const DEFAULT_RUN_ON_CHANGE = false;
export const DEFAULT_FAIL_ON_ERROR = false;
export const DEFAULT_ON_FAIL_ERROR = ON_FAIL_ERROR_HALT;
