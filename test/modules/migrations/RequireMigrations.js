import changelogs from '../../../app/static/db/changelog-master';
import StaticAssetsUtils from '../../../app/utils/StaticAssetsUtils';

const requireContext = require('require-context');

const mp = StaticAssetsUtils.getMigrationsPath();

function importAll(r) {
  changelogs.forEach(changelog => {
    changelog.content = r(`./${changelog.file}`);
  });
}

importAll(requireContext(mp, false, /\.js$/));

export default changelogs;
