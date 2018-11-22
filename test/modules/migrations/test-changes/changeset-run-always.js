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
      runAlways: true,
    },
    generic.changeset('AMPOFFLINE-1307'),
  ]
};

export default ({ changelog });

const c1 = changelog.changesets[0];
const c2 = changelog.changesets[1];

const t1 = {
  [MC.EXECTYPE]: MC.EXECTYPE_RERUN,
  [MC.MD5SUM]: (cObj: Changeset) => (newMd5) => cObj.md5 === cObj.prevDBData[MC.MD5SUM] && cObj.md5 === newMd5,
  [MC.DEPLOYMENT_ID]: (cObj: Changeset) => (newDId) => cObj.prevDBData[MC.DEPLOYMENT_ID] + 1 === newDId
};

const t2 = {
  [MC.EXECTYPE]: MC.EXECTYPE_EXECUTED,
  [MC.MD5SUM]: (cObj: Changeset) => (newMd5) => cObj.md5 === cObj.prevDBData[MC.MD5SUM] && cObj.md5 === newMd5,
  [MC.DEPLOYMENT_ID]: (cObj: Changeset) => (newDId) => cObj.prevDBData[MC.DEPLOYMENT_ID] === newDId
};


export const isValid = (dbMM: DBMigrationsManager, isFirstRun) => {
  if (checkExecutedCount(isFirstRun ? 2 : 1)(dbMM)) {
    if (isFirstRun) {
      return execTypeMatchAll(MC.EXECTYPE_EXECUTED)(dbMM);
    }
    return Promise.all(
      [
        matchByTemplate([getChangesetId(c1, fileName)], t1),
        matchByTemplate([getChangesetId(c2, fileName)], t2),
      ]).then(results => results.every(r => r === true));
  }
  return false;
};
