import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatchAll } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const changelog = {
  changesets: [
    generic.changesetThatRejects('AMPOFFLINE-1307'),
    generic.changesetThatThrows('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  // all must be executed, but recorded in DB as NOT_RUN
  if (checkExecutedCount(2)(dbMM)) {
    return execTypeMatchAll(MC.EXECTYPE_NOT_RUN)(dbMM);
  }
  return false;
};
