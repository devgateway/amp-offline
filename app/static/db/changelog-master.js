/**
 * This is a module to define all changelog files. Update 'changelogs' list in the right order when adding a new file.
 */

const changelogs = [
  {
    file: 'changelog-1.4.0.js',
  }
];

function importAll(r) {
  changelogs.forEach(changelog => {
    changelog.content = r(`./${changelog.file}`);
  });
}

importAll(require.context('./changelog/', false, /\.js$/));

export default changelogs;
