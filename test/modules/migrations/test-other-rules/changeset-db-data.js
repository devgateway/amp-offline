import { checkExecutedCount, getChangesetId, matchByTemplate } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import FileManager from '../../../../app/modules/util/FileManager';
import * as generic from '../templates/generic-changeset';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    generic.changeset('AMPOFFLINE-1307'),
    generic.changesetThatRejects('AMPOFFLINE-1307'),
    generic.changesetWithFailedAndContinuePrecondition('AMPOFFLINE-1307')
  ],
};

export default ({ changelog });

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];
const c3 = changelog.changesets[2];

const t = (c) => ({
  [MC.CHANGEID]: c.changeid,
  [MC.AUTHOR]: c.author,
  [MC.FILENAME]: fileName,
  [MC.CONTEXT]: MC.CONTEXT_STARTUP,
  [MC.COMMENT]: c.comment,
  [MC.DATE_FOUND]: (d) => !!d,
  [MC.DATE_EXECUTED]: (d) => !!d,
  [MC.EXECTYPE]: MC.EXECTYPE_EXECUTED,
});

const t1 = t(c1);
const t2 = {
  ...t(c2),
  [MC.EXECTYPE]: MC.EXECTYPE_NOT_RUN,
};

const t3 = {
  ...t(c3),
  [MC.EXECTYPE]: MC.EXECTYPE_PRECONDITION_FAIL,
};

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(2)(dbMM)) {
    return Promise.all(
      [
        matchByTemplate([getChangesetId(c1, fileName)], t1),
        matchByTemplate([getChangesetId(c2, fileName)], t2),
        matchByTemplate([getChangesetId(c3, fileName)], t3),
      ]).then(results => results.every(r => r === true));
  }
  return false;
};
