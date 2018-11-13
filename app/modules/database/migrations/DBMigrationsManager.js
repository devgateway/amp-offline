/* eslint-disable class-methods-use-this */
import { Validator } from 'jsonschema';
import Logger from '../../util/LoggerManager';
import changelogs from '../../../static/db/changelog-master';
import * as MC from '../../../utils/constants/MigrationsConstants';
import Changeset from './Changeset';
import ChangelogSchema from './schema/ChangelogSchema';
import ChangesetHelper from '../../helpers/ChangesetHelper';
import * as Utils from '../../../utils/Utils';
import DateUtils from '../../../utils/DateUtils';
import NotificationHelper from '../../helpers/NotificationHelper';
import * as ElectronApp from '../../util/ElectronApp';

const logger = new Logger('DB Migrations Manager');

const validator = new Validator();
validator.addSchema(ChangelogSchema, '/ChangelogSchema');


/**
 * Database Migrations Manager for patching DB with pending changesets available under "static/db/changelog" folder
 *
 * @author Nadejda Mandrescu
 */
class DBMigrationsManager {
  constructor() {
    this._executedChangesetIds = new Set();
    this._pendingChangesetsById = new Map();
    this._pendingChangesetsByFile = new Map();
    this._pendingChangelgs = undefined;
    this._deployemntId = undefined;
    this._orderExecutedCounter = 1;
    this._isFailOnError = false;
  }

  static validateChangelog(changelog) {
    return validator.validate(changelog, ChangelogSchema);
  }

  getAndIncOrderExecuted() {
    this._orderExecutedCounter = this._orderExecutedCounter + 1;
    return this._orderExecutedCounter - 1;
  }

  /**
   * Provides all currently pending changelogs
   * @return {Promise}
   */
  detectAndValidateChangelogs() {
    if (this._pendingChangelgs) {
      return this._refreshPendingChangelogs();
    }
    return this._detectAllValidAndPendingChangelogs();
  }

  _refreshPendingChangelogs() {
    const refreshedChangesetsByFile = new Map();
    this._pendingChangesetsByFile.forEach((chs, file) => {
      chs = chs.filter((c: Changeset) => this._pendingChangesetsById.has(c.id));
      if (chs.length) {
        refreshedChangesetsByFile.set(file, chs);
      }
    });
    this._pendingChangesetsByFile = refreshedChangesetsByFile;
    this._pendingChangelgs = this._pendingChangelgs.filter(cl => this._pendingChangesetsByFile.has(cl[MC.FILE]));
    return Promise.resolve().then(() => this._pendingChangelgs);
  }

  _detectAllValidAndPendingChangelogs() {
    return this._getChangesetsSummary().then((dbChangesetsMap: Map) => {
      const newChangesets = [];
      this._pendingChangelgs = changelogs.filter(chdef => {
        const file = chdef[MC.FILE];
        logger.debug(`Verifying '${file}' changelog`);
        const changelog = chdef[MC.CONTENT];
        const result = DBMigrationsManager.validateChangelog(changelog);
        if (!result.valid) {
          logger.error(`Skipping '${file}', since not in a valid format: ${JSON.stringify(result.errors)}`);
          return false;
        }
        const pendingCount = this._detectPending(chdef, dbChangesetsMap, newChangesets);
        logger.log(`Detected '${file}' changelog. Has ${pendingCount} pending changesets.`);
        if (pendingCount) {
          Changeset.setDefaultsForPreconditions(changelog[MC.PRECONDITIONS]);
        }
        return pendingCount;
      });
      logger.info(`Found ${this._pendingChangesetsById.size} total changesets to execute.`);
      return this._saveNewChangesets(newChangesets);
    }).then(() => this._pendingChangelgs);
  }

  _getChangesetsSummary() {
    return ChangesetHelper.findAllChangesets({}, { id: 1, [MC.MD5SUM]: 1, [MC.DEPLOYMENT_ID]: 1, [MC.DATE_FOUND]: 1 })
      .then(chs => {
        if (this._deployemntId === undefined) {
          this._deployemntId = Math.max(0, ...chs.map(c => c[MC.DEPLOYMENT_ID])) + 1;
        }
        return chs;
      })
      .then(Utils.toMapByKey);
  }

  _detectPending(chdef, dbChangesetsMap: Map, newChangesets: Array) {
    const chs = chdef[MC.CONTENT][MC.CHANGELOG][MC.CHANGESETS];
    const pendingChs = [];
    const csCount = chs.filter(c => {
      const changeset = new Changeset(c, chdef);
      const dbC = dbChangesetsMap.get(changeset.id);
      let willRun = changeset.isRunAlways || !dbC;
      if (!dbC) {
        newChangesets.push(changeset);
        changeset.dateFound = DateUtils.getISODateForAPI();
      } else if (changeset.md5 !== c[MC.MD5SUM]) {
        willRun = willRun || changeset.isRunOnChange;
        changeset.dateFound = dbC[MC.DATE_FOUND];
        logger.error(`${changeset.id}: MD5 mismatch detected. ${willRun ? 'It is' : 'Not'} scheduled to rerun.`);
      }
      if (willRun) {
        this._pendingChangesetsById.set(changeset.id, changeset);
        pendingChs.push(changeset);
        return true;
      }
      return false;
    }).length;
    if (csCount) {
      this._pendingChangesetsByFile.set(chdef[MC.FILE], pendingChs);
    }
    return csCount;
  }

  _saveNewChangesets(newChangesets: Array) {
    if (!newChangesets.length) {
      return Promise.resolve();
    }
    const template = {
      [MC.DEPLOYMENT_ID]: this._deployemntId,
    };
    return this._saveChangesets(newChangesets, template);
  }

  _saveChangesets(changesets: Array, template = {}) {
    template[MC.DEPLOYMENT_ID] = this._deployemntId;
    const dbcs = changesets.map(c => ChangesetHelper.changesetToDBFormat(c, template));
    return ChangesetHelper.saveOrUpdateChangesetCollection(dbcs)
      .catch(error => {
        logger.error(`Couldn't save changesets: ${error}`);
        return Promise.resolve();
      });
  }

  run(context: string) {
    logger.log(`Running DB changelogs for '${context}' context`);
    if (!MC.CONTEXT_OPTIONS.includes(context)) {
      logger.error('Invalid context. Skipping.');
      return Promise.resolve();
    }
    return this.detectAndValidateChangelogs()
      .then(pendingChangelogs => this._runChangelogs(pendingChangelogs, context))
      .then(() => {
        logger.log('DB changelogs execution complete');
        return Promise.resolve();
      });
  }

  _runChangelogs(pendingChangelogs: Array, context: string) {
    return pendingChangelogs.reduce((prevPromise, chdef) => {
      const changelog = chdef[MC.CONTENT][MC.CHANGELOG];
      const fileName = chdef[MC.FILE];
      // TODO find changesets for current context only
      const chs = this._pendingChangesetsByFile.get(fileName);
      chs.forEach((c: Changeset) => { c.execContext = context; });
      return prevPromise.then(() => {
        logger.debug(`Checking '${fileName}' changelog...`);
        return this._checkPreConditions(changelog[MC.PRECONDITIONS]);
      }).then(preconditionStatus => {
        if (preconditionStatus !== MC.EXECTYPE_PRECONDITION_SUCCESS) {
          logger.warn(`Skipping '${fileName}' changelog with failed preconditions, having pending changesets: ${chs}.`);
          return this._saveChangesets(chs, { [MC.EXECTYPE]: preconditionStatus });
        }
        return this._runChangesets(chs);
      });
    }, Promise.resolve());
  }

  _checkPreConditions(preconditions) {
    // eslint-disable-next-line prefer-const
    let preconditionsPass = MC.EXECTYPE_PRECONDITION_SUCCESS;
    if (preconditions && preconditions.length) {
      logger.log('Running preconditions check...');
      // TODO actual preconditions check
      logger.log(`Preconditions check pass = ${preconditionsPass.toString().toUpperCase()} `);
    } else {
      logger.log('No preconditions');
    }
    return preconditionsPass;
  }

  _checkPreCondition(func: Function) {
    try {
      return Promise.resolve()
        .then(func)
        .then(result => {
          if (result === true) {
            return MC.EXECTYPE_PRECONDITION_SUCCESS;
          }
          if (result === false) {
            return MC.EXECTYPE_PRECONDITION_FAIL;
          }
          return MC.EXECTYPE_PRECONDITION_ERROR;
        })
        .catch(error => {
          logger.error(error);
          return MC.EXECTYPE_PRECONDITION_ERROR;
        });
    } catch (e) {
      logger.error(e);
      return MC.EXECTYPE_PRECONDITION_ERROR;
    }
  }

  _runChangesets(changesets: Array<Changeset>) {
    // TODO full implementation
    return changesets.reduce((prevPromise, changeset: Changeset) => prevPromise.then(() => {
      if (this._isFailOnError) {
        return Promise.resolve();
      }
      logger.log(`Executing '${changeset.id}' changeset...`);
      logger.debug(`Comment: ${changeset.comment}`);
      logger.debug(`md5 = ${changeset.md5}`);
      if (changeset.md5 !== changeset.tmpGetDBMd5()) {
        // TODO remove, since detected earlier, it's for testing only
        logger.error('MD5 doesn\'t match!');
      }
      return this._runChangeset(changeset).then(() => {
        // storing execution date for success and also for error to see the last attempt
        changeset.dateExecuted = DateUtils.getISODateForAPI();
        this._isFailOnError = !!(changeset.isFailOnError && changeset.error);
        return this._saveChangesets([changeset]).then(() => {
          if (this._isFailOnError) {
            const notification = new NotificationHelper({ message: 'failOnErrorMessage' });
            alert(notification.message);
            ElectronApp.forceCloseApp();
          }
          return this._isFailOnError;
        });
      });
    }), Promise.resolve());
  }

  _runChangeset(changeset: Changeset) {
    // TODO check if func or update, flag status based on result, etc
    return Promise.resolve().then(changeset.change)
      .then(() => {
        logger.log(`${changeset.id} executed successfully`);
        changeset.execType = MC.EXECTYPE_EXECUTED;
        changeset.orderExecuted = this.getAndIncOrderExecuted();
        this._pendingChangesetsById.delete(changeset.id);
        return changeset;
      })
      .catch(error => {
        logger.error(`${changeset.id} execution error: ${error}`);
        changeset.error = error || 'Unknown error';
        if (changeset.rollback) {
          logger.log('Executing the rollback...');
          return Promise.resolve().then(changeset.rollback)
            .then(() => {
              logger.log('Rollback executed successfully');
              changeset.rollbackExecType = MC.EXECTYPE_EXECUTED;
              return changeset;
            }).catch(err => {
              logger.error(`Rollback execution failed: ${err}`);
              changeset.rollbackError = err || 'Unknown error';
              return changeset;
            });
        }
        return changeset;
      });
  }

}

const dbMigrationsManager = new DBMigrationsManager();
Utils.selfBindMethods(dbMigrationsManager);

export default dbMigrationsManager;
