import prodChangelogs from '../../../app/static/db/changelog-master';
import * as tm from './test-changelog-master';
import StaticAssetsUtils from '../../../app/utils/StaticAssetsUtils';
import TestUtils from '../../TestUtils';

const requireContext = require('require-context');

function importAll(r, chs) {
  chs.forEach(changelog => {
    changelog.content = r(`./${changelog.file}`);
  });
}

const mp = StaticAssetsUtils.getMigrationsPath();
importAll(requireContext(mp, false, /\.js$/), prodChangelogs);
importAll(requireContext(TestUtils.getTestMigrationsPath('invalid-schema'), false, /\.js$/), tm.invalidSchema);

module.exports = {
  prodChangelogs,
  invalidSchema: tm.invalidSchema,
};
