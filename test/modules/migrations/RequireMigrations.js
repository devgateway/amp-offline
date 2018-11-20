import prodChangelogs from '../../../app/static/db/changelog-master';
import StaticAssetsUtils from '../../../app/utils/StaticAssetsUtils';

const requireContext = require('require-context');

function importAll(r, chs) {
  chs.forEach(changelog => {
    changelog.content = r(`./${changelog.file}`);
  });
}

const mp = StaticAssetsUtils.getMigrationsPath();
importAll(requireContext(mp, false, /\.js$/), prodChangelogs);

module.exports = {
  prodChangelogs,
};
