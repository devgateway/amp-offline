/** Each file should test a single invalid schema definition */
export const invalidSchema = [
  'test-changelog-missing-root.js',
  'changelog-precondition-on-error-continue.js',
  'changelog-precondition-on-error-mark-run.js',
  'changelog-precondition-on-fail-continue.js',
  'changelog-precondition-on-fail-mark-run.js',
  'changelog-precondition-as-string.js',
  'changelog-precondition-extra-fields.js',
  'changelog-precondition-both-func-and-changeset-dependency.js',
  'changeset-changeid-not-string.js',
  'changeset-changeid-missing.js',
  'changeset-author-missing.js',
  'changeset-author-not-string.js',
  'changeset-changes-missing.js',
  'changeset-changes-not-array.js',
  'changeset-changes-rule-missing.js',
  'changeset-run-always-not-boolean.js',
  'changeset-run-on-change-not-boolean.js',
  'changeset-comment-not-string.js',
  'changeset-context-not-string-or-array.js',
  'changeset-context-not-valid-option.js',
].map(file => ({ file }));

/** Tests for preconditions */
export const testPreConditions = [
  'changelog-precondition-pass.js',
  'changeset-precondition-pass.js',
  'no-precondition-pass.js',
  'changeset-precondition-fail-and-continue.js',
  'changeset-precondition-fail-and-default.js',
  'changelog-precondition-fail-and-default.js',
  'changeset-precondition-fail-and-markrun.js',
  'changeset-precondition-fail-and-warn.js',
  'changelog-precondition-error-and-default.js',
  'changeset-precondition-error-and-continue.js',
  'changeset-precondition-error-and-default.js',
  'changeset-precondition-error-and-markrun.js',
  'changeset-precondition-error-and-warn.js',
].map(file => ({ file }));

/** Tests for changes */
export const testChanges = [
  'changeset-func-update-pass.js',
  'changeset-fail-on-error.js',
  'changeset-func-reject-or-throw.js',
].map(file => ({ file }));

export const runTwice = [
  'changeset-run-always.js',
  'changeset-run-on-change.js',
].map(file => ({ file }));

export const testContext = [
  'changeset-context-startup.js',
  'changeset-context-init.js',
  'changeset-context-all-or-list-of-startup-and-init.js',
].map(file => ({ file }));

export const testRollback = [
  'changeset-no-rollback-on-change-fail.js',
  'changeset-rollback-successful.js',
  'changeset-rollback-fail.js',
].map(file => ({ file }));

export const otherRules = [
  'changeset-id.js',
  'changeset-db-data.js',
  'changeset-no-dateexecuted.js',
  'changeset-order-executed.js',
].map(file => ({ file }));
