/** Each file should test a single invalid schema definition */
export const invalidSchema = [
  'test-changelog-missing-root.js',
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
].map(file => ({ file }));
