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
  'changeset-changes-not-object.js',
  'changeset-changes-rule-missing.js',
  'changeset-run-always-not-boolean.js',
  'changeset-run-on-change-not-boolean.js',
  'changeset-comment-not-string.js',
  'changeset-context-not-string-or-array.js',
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
].map(file => ({ file }));
