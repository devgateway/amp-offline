import DBMigrationsManager from '../../../app/modules/database/migrations/DBMigrationsManager';
import ChangelogLogger from '../../../app/static/db/ChangelogLogger';
import ChangesetHelper from '../../../app/modules/helpers/ChangesetHelper';
import * as Utils from '../../../app/utils/Utils';
import * as MC from '../../../app/utils/constants/MigrationsConstants';
import Changeset from '../../../app/modules/database/migrations/Changeset';
import * as LanguageHelper from '../../../app/modules/helpers/LanguageHelper';

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

export const checkExecutedCount = (count) => (dbMM: DBMigrationsManager) => count === dbMM.executedChangesetIds.size;

export const execTypeMatch = (execTypeToMatch: string, matchIds: Array) =>
  ChangesetHelper.findAllChangesets({ id: { $in: matchIds } }, { [MC.EXECTYPE]: 1 })
    .then((cs) => {
      const execTypesSet = new Set(Utils.flattenToListByKey(cs, MC.EXECTYPE));
      return execTypesSet.size === 1 && execTypesSet.has(execTypeToMatch);
    });

export const execTypeMatchAll = (execTypeToMatch) => (dbMM: DBMigrationsManager) => {
  const matchIds = getAllKnownInLastIteration(dbMM);
  return execTypeMatch(execTypeToMatch, matchIds);
};

const getAllKnownInLastIteration = (dbMM: DBMigrationsManager) =>
  Array.from(dbMM.pendingChangesetsById.keys()).concat(Array.from(dbMM.executedChangesetIds.keys()));

export const matchByTemplate = (ids: Array, template: Object) =>
  ChangesetHelper.findAllChangesets({ id: { $in: ids } })
    .then(cs => {
      const keys = Object.keys(template);
      return cs.every(c => keys.every(k => {
        if (typeof template[k] === 'function') {
          return template[k](c[k]);
        }
        return template[k] === c[k];
      }));
    });

export const matchAllProcessedByTemplate = (template: Object, dbMM: DBMigrationsManager) => {
  const ids = getAllKnownInLastIteration(dbMM);
  return matchByTemplate(ids, template);
};

export const getChangesetId = (rawChangeset, fileName) => Changeset.buildId(rawChangeset, { file: fileName });

export const replaceLanguagesForTest = (languages) => LanguageHelper.replaceCollection(languages);
