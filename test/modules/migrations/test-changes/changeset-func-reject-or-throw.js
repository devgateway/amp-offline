import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatchAll } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import * as LanguageHelper from '../../../../app/modules/helpers/LanguageHelper';

const c3 = generic.changesetUpdate('AMPOFFLINE-1359');
c3.changes.unshift(generic.funcThatRejects);

const changelog = {
  changesets: [
    generic.changesetThatRejects('AMPOFFLINE-1307'),
    generic.changesetThatThrows('AMPOFFLINE-1307'),
    c3,
  ]
};

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  // all must be executed, but recorded in DB as NOT_RUN
  if (checkExecutedCount(3)(dbMM)) {
    if (execTypeMatchAll(MC.EXECTYPE_NOT_RUN)(dbMM)) {
      return LanguageHelper.findById('en').then(lang => lang.name !== c3.changes[1].update.value);
    }
  }
  return false;
};
