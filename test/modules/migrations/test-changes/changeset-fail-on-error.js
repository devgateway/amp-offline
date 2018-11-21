import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatchAll } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const changelog = {
  changesets: [
    generic.changeset('AMPOFFLINE-1307'),
    generic.changeset('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

const c1 = changelog.changesets[0];

c1[MC.FAIL_ON_ERROR] = true;
c1.changes = generic.funcThatRejects;

export const isValid = (dbMM: DBMigrationsManager) => {
  // c1 will be executed (even if with error), while c2 won't run, but both will be marked in DB as NOT_RUN
  if (checkExecutedCount(1)(dbMM) && dbMM.isFailOnError) {
    return execTypeMatchAll(MC.EXECTYPE_NOT_RUN)(dbMM);
  }
  return false;
};
