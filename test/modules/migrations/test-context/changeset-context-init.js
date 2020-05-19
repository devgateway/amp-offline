import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatch, getChangesetId } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import FileManager from '../../../../app/modules/util/FileManager';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    // default startup
    generic.changeset('AMPOFFLINE-1307'),
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      context: MC.CONTEXT_INIT,
    },
    // defaults to startup, but due to 2nd changeset dependency (set below) won't run (would run at next startup only)
    generic.changeset('AMPOFFLINE-1307')
  ]
};

export default ({ changelog });

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];
const c3 = changelog.changesets[2];

c3.preConditions = [{
  changeid: c2.changeid,
  author: c2.author,
  file: fileName,
  onFail: MC.ON_FAIL_ERROR_CONTINUE
}];


export const isValid = (dbMM: DBMigrationsManager) => {
  if (dbMM.contextWrapper.context === MC.CONTEXT_STARTUP) {
    if (checkExecutedCount(1)(dbMM)) {
      return Promise.all(
        [
          [getChangesetId(c1, fileName), MC.EXECTYPE_EXECUTED],
          [getChangesetId(c2, fileName), MC.EXECTYPE_NOT_RUN],
          [getChangesetId(c3, fileName), MC.EXECTYPE_PRECONDITION_FAIL]
        ].map(([id, execType]) => execTypeMatch(execType, [id])))
        .then(results => results.every(r => r === true));
    }
  } else if (dbMM.contextWrapper.context === MC.CONTEXT_INIT) {
    if (checkExecutedCount(1)(dbMM)) {
      return Promise.all(
        [
          [getChangesetId(c1, fileName), MC.EXECTYPE_EXECUTED],
          [getChangesetId(c2, fileName), MC.EXECTYPE_EXECUTED],
          [getChangesetId(c3, fileName), MC.EXECTYPE_PRECONDITION_FAIL]
        ].map(([id, execType]) => execTypeMatch(execType, [id])))
        .then(results => results.every(r => r === true));
    }
  } else if (dbMM.contextWrapper.context === MC.CONTEXT_AFTER_LOGIN) {
    return Promise.resolve(true);
  }
  return false;
};
