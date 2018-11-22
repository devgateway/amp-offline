import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatchAll } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const changelog = {
  changesets: [
    // func
    generic.changeset('AMPOFFLINE-1307'),
    // update
    generic.changesetUpdate('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(2)(dbMM)) {
    return execTypeMatchAll(MC.EXECTYPE_EXECUTED)(dbMM);
  }
  return false;
};
