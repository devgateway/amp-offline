import { checkExecutedCount, getChangesetId, matchByTemplate } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import FileManager from '../../../../app/modules/util/FileManager';
import * as generic from '../templates/generic-changeset';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    generic.changeset('AMPOFFLINE-1307'),
    generic.changeset('AMPOFFLINE-1307'),
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
const c3 = changelog.changesets[2];
const c4 = changelog.changesets[3];

const t1 = {
  [MC.ORDER_EXECUTED]: 1,
  [MC.EXECTYPE]: MC.EXECTYPE_EXECUTED,
};

const t2 = {
  [MC.ORDER_EXECUTED]: 2,
  [MC.EXECTYPE]: MC.EXECTYPE_EXECUTED,
};

const t3 = {
  [MC.ORDER_EXECUTED]: (order) => !order,
  [MC.EXECTYPE]: MC.EXECTYPE_PRECONDITION_FAIL,
};

const t4 = {
  [MC.ORDER_EXECUTED]: (order) => !order,
  [MC.EXECTYPE]: MC.EXECTYPE_NOT_RUN,
};

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(2)(dbMM)) {
    return Promise.all(
      [
        matchByTemplate([getChangesetId(c1, fileName)], t1),
        matchByTemplate([getChangesetId(c2, fileName)], t2),
        matchByTemplate([getChangesetId(c3, fileName)], t3),
        matchByTemplate([getChangesetId(c4, fileName)], t4),
      ]).then(results => results.every(r => r === true));
  }
  return false;
};
