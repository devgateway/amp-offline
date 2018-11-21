import * as generic from '../templates/generic-changeset';
import FileManager from '../../../../app/modules/util/FileManager';
import { checkExecutedCount, execTypeMatch, getChangesetId } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const fileName = FileManager.basename(__filename);

const changelog = {
  preConditions: [generic.preconditionErrorAndDefault],
  changesets: generic.changesets('AMPOFFLINE-1307')
};

const c1 = changelog.changesets[0];

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(0)(dbMM)) {
    return execTypeMatch(MC.EXECTYPE_PRECONDITION_ERROR, [getChangesetId(c1, fileName)]);
  }
  return false;
};
