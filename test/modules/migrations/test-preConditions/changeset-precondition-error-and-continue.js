import * as generic from '../templates/generic-changeset';
import FileManager from '../../../../app/modules/util/FileManager';
import { checkExecutedCount, execTypeMatch, getChangesetId } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      // only func
      preConditions: [generic.preconditionErrorAndContinueFunc]
    },
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      // func and dependent above changeset (dependency configured below)
      preConditions: [generic.preconditionPassFunc]
    },
  ]
};

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];
c2.preConditions.push({
  changeid: c1.changeid,
  author: c1.author,
  file: fileName,
  onFail: MC.ON_FAIL_ERROR_CONTINUE
});

export default ({ changelog });

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(0)(dbMM)) {
    return Promise.all(
      [
        [getChangesetId(c1, fileName), MC.EXECTYPE_PRECONDITION_ERROR],
        [getChangesetId(c2, fileName), MC.EXECTYPE_PRECONDITION_FAIL]
      ].map(([id, execType]) => execTypeMatch(execType, [id])))
      .then(results => results.every(r => r === true));
  }
  return false;
};
