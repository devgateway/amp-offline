import DBMigrationsManager from '../../../app/modules/database/migrations/DBMigrationsManager';
import ChangelogLogger from '../../../app/static/db/ChangelogLogger';

export const checkAllExecuted = (fileName) => (dbMM: DBMigrationsManager) => {
  let allExecuted = dbMM.executedChangesetIds.size;
  if (allExecuted) {
    dbMM.refreshPendingChangelogs();
    allExecuted = !dbMM.pendingChangelogs.some(pc => pc.file === fileName);
  }
  if (!allExecuted) {
    ChangelogLogger.error(`checkAllExecuted failed for ${fileName}`);
  }
  return allExecuted;
};

export const placeholder = '';
