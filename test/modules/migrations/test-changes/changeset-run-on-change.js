import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatch, execTypeMatchAll, getChangesetId } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import FileManager from '../../../../app/modules/util/FileManager';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      runOnChange: true,
    },
    {
      ...generic.changesetUpdate('AMPOFFLINE-1307'),
      runOnChange: true,
    },
    generic.changeset('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];
const c3 = changelog.changesets[2];

export const isValid = (dbMM: DBMigrationsManager, isFirstRun) => {
  if (isFirstRun) {
    beforeRerun();
  }
  if (checkExecutedCount(isFirstRun ? 3 : 2)(dbMM)) {
    if (isFirstRun) {
      return execTypeMatchAll(MC.EXECTYPE_EXECUTED)(dbMM);
    }
    return Promise.all(
      [
        [getChangesetId(c1, fileName), MC.EXECTYPE_RERUN],
        [getChangesetId(c2, fileName), MC.EXECTYPE_RERUN],
        [getChangesetId(c3, fileName), MC.EXECTYPE_EXECUTED]
      ].map(([id, execType]) => execTypeMatch(execType, [id])))
      .then(results => results.every(r => r === true));
  }
  return false;
};

const beforeRerun = () => {
  c1.changes.func = () => 'Modified func that should affect MD5';
  c2.changes.update.value = 'English-modified to trigger MD5';
  c3.changes.func = () => 'Modified func that should affect MD5 but will not trigger update (runOnChange=false)';
};
