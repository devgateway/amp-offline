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
      runAlways: true,
    },
    generic.changeset('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];

export const isValid = (dbMM: DBMigrationsManager, isFirstRun) => {
  if (checkExecutedCount(isFirstRun ? 2 : 1)(dbMM)) {
    if (isFirstRun) {
      return execTypeMatchAll(MC.EXECTYPE_EXECUTED)(dbMM);
    }
    return Promise.all(
      [
        [getChangesetId(c1, fileName), MC.EXECTYPE_RERUN],
        [getChangesetId(c2, fileName), MC.EXECTYPE_EXECUTED]
      ].map(([id, execType]) => execTypeMatch(execType, [id])))
      .then(results => results.every(r => r === true));
  }
  return false;
};
