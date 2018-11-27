import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, matchAllProcessedByTemplate } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const changelog = {
  changesets: [
    generic.changesetThatRejectsWithFailedRollback('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

const template = {
  [MC.EXECTYPE]: MC.EXECTYPE_NOT_RUN,
  [MC.ERROR]: (e) => !!e,
  [MC.ROLLBACKEXECTYPE]: MC.EXECTYPE_NOT_RUN,
  [MC.ROLLBACKERROR]: (re) => !!re,
};

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(1)(dbMM)) {
    return matchAllProcessedByTemplate(template, dbMM);
  }
  return false;
};
