import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatchAll } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import * as LanguageHelper from '../../../../app/modules/helpers/LanguageHelper';

const c3 = generic.changesetWithMultipleChanges('AMPOFFLINE-1359');

const changelog = {
  changesets: [
    // func
    generic.changeset('AMPOFFLINE-1307'),
    // update
    generic.changesetUpdate('AMPOFFLINE-1307'),
    // multiple
    c3
  ]
};

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(3)(dbMM)) {
    if (execTypeMatchAll(MC.EXECTYPE_EXECUTED)(dbMM)) {
      return LanguageHelper.findById('en').then(lang => lang.name === c3.changes[1].update.value);
    }
  }
  return false;
};
