import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatchAll } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const changelog = {
  changesets: [
    // default startup
    generic.changeset('AMPOFFLINE-1307'),
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      context: MC.CONTEXT_STARTUP,
    }
  ]
};

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  if (dbMM.contextWrapper.context === MC.CONTEXT_STARTUP) {
    if (checkExecutedCount(2)(dbMM)) {
      return execTypeMatchAll(MC.EXECTYPE_EXECUTED)(dbMM);
    }
  } else {
    return (checkExecutedCount(0)(dbMM));
  }
  return false;
};
