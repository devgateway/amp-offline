import { checkExecutedCount, matchAllProcessedByTemplate } from '../MigrationsTestUtils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../../../app/modules/database/migrations/DBMigrationsManager';
import FileManager from '../../../../app/modules/util/FileManager';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [{
    changeid: 'AMPOFFLINE-1307-test-id-consistency',
    author: 'nmandrescu',
    comment: 'Generic changeset',
    context: 'startup',
    changes: {
      func: () => {
      }
    }
  }]
};

export default ({ changelog });

const c1 = changelog.changesets[0];

const expectedId = `${c1.changeid}-${c1.author}-${fileName}`;

const template = {
  id: expectedId,
  [MC.EXECTYPE]: MC.EXECTYPE_EXECUTED,
};

export const isValid = (dbMM: DBMigrationsManager) => {
  if (checkExecutedCount(1)(dbMM)) {
    return matchAllProcessedByTemplate(template, dbMM);
  }
  return false;
};
