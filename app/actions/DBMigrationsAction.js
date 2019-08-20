import changelogs from '../static/db/changelog-master';
import DBMigrationsManager from '../modules/database/migrations/DBMigrationsManager';

function importAll(r) {
  changelogs.forEach(changelog => {
    changelog.content = r(`./${changelog.file}`);
  });
}

importAll(require.context('../static/db/changelog/', false, /\.js$/));

export const dbMigrationsManager = new DBMigrationsManager(changelogs);

export default dbMigrationsManager;
