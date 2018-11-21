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
