import { checkExecutedCount, getChangesetId, matchByTemplate } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import FileManager from '../../../../app/modules/util/FileManager';
import * as generic from '../templates/generic-changeset';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      preConditions: [generic.preconditionFailAndDefault],
    },
    generic.changeset('AMPOFFLINE-1307'),
  ],
};

export default ({ changelog });

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];

const t1 = {
  [MC.DATE_FOUND]: (d) => !!d,
  [MC.DATE_EXECUTED]: (d) => !!d,
  [MC.EXECTYPE]: MC.EXECTYPE_PRECONDITION_FAIL,
};

const t2 = {
  ...t1,
  [MC.DATE_EXECUTED]: (d) => !d,
  [MC.EXECTYPE]: MC.EXECTYPE_NOT_RUN,
};

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(0)(dbMM)) {
    return Promise.all(
      [
        matchByTemplate([getChangesetId(c1, fileName)], t1),
        matchByTemplate([getChangesetId(c2, fileName)], t2),
      ]).then(results => results.every(r => r === true));
  }
  return false;
};
