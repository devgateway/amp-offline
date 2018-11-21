import prodChangelogs from '../../../app/static/db/changelog-master';
import * as tm from './test-changelog-master';
import StaticAssetsUtils from '../../../app/utils/StaticAssetsUtils';
import TestUtils from '../../TestUtils';

const requireContext = require('require-context');

function importAll(r, chs) {
  chs.forEach(changelog => {
    const contentPossiblyWithExtra = r(`./${changelog.file}`);
    changelog.content = contentPossiblyWithExtra.default || contentPossiblyWithExtra;
    changelog.isValid = contentPossiblyWithExtra.isValid || (() => true);
  });
}

const mp = StaticAssetsUtils.getMigrationsPath();
importAll(requireContext(mp, false, /\.js$/), prodChangelogs);
importAll(requireContext(TestUtils.getTestMigrationsPath('invalid-schema'), false, /\.js$/), tm.invalidSchema);
importAll(requireContext(TestUtils.getTestMigrationsPath('test-preConditions'), false, /\.js$/), tm.testPreConditions);
importAll(requireContext(TestUtils.getTestMigrationsPath('test-changes'), false, /\.js$/), tm.testChanges);
importAll(requireContext(TestUtils.getTestMigrationsPath('test-changes'), false, /\.js$/), tm.runTwice);

module.exports = {
  prodChangelogs,
  invalidSchema: tm.invalidSchema,
  testPreConditions: tm.testPreConditions,
  testChanges: tm.testChanges,
  runTwice: tm.runTwice,
};
