import * as generic from '../templates/generic-changeset';
import { checkExecutedCount, execTypeMatchAll, getChangesetId, matchByTemplate } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import FileManager from '../../../../app/modules/util/FileManager';
import Changeset from '../../../../app/modules/database/migrations/Changeset';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      runOnChange: true,
    },
    {
      ...generic.changesetUpdate('AMPOFFLINE-1307'),
      runOnChange: true,
    },
    generic.changeset('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];
const c3 = changelog.changesets[2];

const t1And2 = {
  [MC.EXECTYPE]: MC.EXECTYPE_RERUN,
  [MC.MD5SUM]: (cObj: Changeset) => (newMd5) => cObj.md5 !== cObj.prevDBData[MC.MD5SUM] && cObj.md5 === newMd5,
  [MC.DEPLOYMENT_ID]: (cObj: Changeset) => (newDId) => cObj.prevDBData[MC.DEPLOYMENT_ID] + 1 === newDId
};

const t3 = {
  [MC.EXECTYPE]: MC.EXECTYPE_EXECUTED,
  [MC.MD5SUM]: (cObj: Changeset) => (newMd5) => cObj.md5 === cObj.prevDBData[MC.MD5SUM] && cObj.md5 === newMd5,
  [MC.DEPLOYMENT_ID]: (cObj: Changeset) => (newDId) => cObj.prevDBData[MC.DEPLOYMENT_ID] === newDId
};

export const isValid = (dbMM: DBMigrationsManager, isFirstRun) => {
  if (isFirstRun) {
    beforeRerun();
  }
  if (checkExecutedCount(isFirstRun ? 3 : 2)(dbMM)) {
    if (isFirstRun) {
      return execTypeMatchAll(MC.EXECTYPE_EXECUTED)(dbMM);
    }
    return Promise.all(
      [
        matchByTemplate([getChangesetId(c1, fileName)], t1And2),
        matchByTemplate([getChangesetId(c2, fileName)], t1And2),
        matchByTemplate([getChangesetId(c3, fileName)], t3),
      ]).then(results => results.every(r => r === true));
  }
  return false;
};

const beforeRerun = () => {
  c1.changes[0].func = () => 'Modified func that should affect MD5';
  c2.changes[0].update.value = 'English-modified to trigger MD5';
  c3.changes[0].func = () => 'Modified func that should affect MD5 but will not trigger update (runOnChange=false)';
};
