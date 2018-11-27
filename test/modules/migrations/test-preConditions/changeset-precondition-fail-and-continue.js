import * as generic from '../templates/generic-changeset';
import FileManager from '../../../../app/modules/util/FileManager';
import { checkExecutedCount, execTypeMatchAll } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      // only func
      preConditions: [generic.preconditionFailAndContinueFunc]
    },
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      // func and dependent above changeset (dependency configured below)
      preConditions: [generic.preconditionPassFunc]
    },
  ]
};

const c1 = changelog.changesets[0];
changelog.changesets[1].preConditions.push({
  changeid: c1.changeid,
  author: c1.author,
  file: fileName,
  onFail: MC.ON_FAIL_ERROR_CONTINUE
});

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(0)(dbMM)) {
    return execTypeMatchAll(MC.EXECTYPE_PRECONDITION_FAIL)(dbMM);
  }
  return false;
};
