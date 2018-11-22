/* eslint-disable class-methods-use-this */
import { Validator } from 'jsonschema';
import Logger from '../../util/LoggerManager';
import * as MC from '../../../utils/constants/MigrationsConstants';
import Changeset from './Changeset';
import ChangelogSchema from './schema/ChangelogSchema';
import ChangesetHelper from '../../helpers/ChangesetHelper';
import * as Utils from '../../../utils/Utils';
import DateUtils from '../../../utils/DateUtils';
import NotificationHelper from '../../helpers/NotificationHelper';
import * as ElectronApp from '../../util/ElectronApp';
import PreCondition from './PreCondition';
import Context from './Context';

const logger = new Logger('DB Migrations Manager');

const validator = new Validator();
validator.addSchema(ChangelogSchema, '/ChangelogSchema');

/**
 * Database Migrations Manager for patching DB with pending changesets available under "static/db/changelog" folder
 *
 * @author Nadejda Mandrescu
 */
export default class DBMigrationsManager {
  /**
   * @param changelogs a list of changelogs definitions [{ file: 'abc.js', content: {...}}, ...]
   */
  constructor(changelogs) {
    this._changelogs = changelogs;
    this._executedChangesetIds = new Set();
    this._pendingChangesetsById = new Map();
    this._pendingChangesetsByFile = new Map();
    this._pendingChangelogs = undefined;
    this._deployemntId = undefined;
    this._orderExecutedCounter = 1;
    this._isFailOnError = false;
    this._contextWarpper = new Context();
    Utils.selfBindMethods(this);
  }

  static validateChangelog(changelog) {
    return validator.validate(changelog, ChangelogSchema);
  }

  static _getSuccessExecType(changeset: Changeset) {
    if (changeset.prevDBData && MC.EXECTYPE_SUCCESS_OPTIONS.includes(changeset.prevDBData[MC.EXECTYPE])) {
      return MC.EXECTYPE_RERUN;
    }
    return MC.EXECTYPE_EXECUTED;
  }

  /**
   * @return {Array}
   */
  get pendingChangelogs() {
    return this._pendingChangelogs;
  }

  /**
   * @return {Map<any, any>}
   */
  get pendingChangesetsById() {
    return this._pendingChangesetsById;
  }

  /**
   * @return {Set<any>}
   */
  get executedChangesetIds() {
    return this._executedChangesetIds;
  }

  get isFailOnError() {
    return this._isFailOnError;
  }

  /**
   * @return {Context}
   */
  get contextWrapper() {
    return this._contextWarpper;
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
    if (this._pendingChangelogs) {
      return Promise.resolve().then(this.refreshPendingChangelogs);
    }
    return this._detectAllValidAndPendingChangelogs();
  }

  refreshPendingChangelogs() {
    const refreshedChangesetsByFile = new Map();
    this._executedChangesetIds.clear();
    this._pendingChangesetsByFile.forEach((chs, file) => {
      chs = chs.filter((c: Changeset) => {
        if (this._pendingChangesetsById.has(c.id)) {
          if (this._contextWarpper.canRunNowOrLater(c)) {
            return true;
          }
          this._pendingChangesetsById.delete(c.id);
        }
        return false;
      });
      if (chs.length) {
        refreshedChangesetsByFile.set(file, chs);
      }
    });
    this._pendingChangesetsByFile = refreshedChangesetsByFile;
    this._pendingChangelogs = this._pendingChangelogs.filter(cl => this._pendingChangesetsByFile.has(cl[MC.FILE]));
    logger.log(`All pending changelogs count: ${this._pendingChangelogs.length}`);
    return this._pendingChangelogs;
  }

  _detectAllValidAndPendingChangelogs() {
    return this._getChangesetsSummary().then((dbChangesetsMap: Map) => {
      const newChangesets = [];
      this._pendingChangelogs = this._changelogs.filter(chdef => {
        const file = chdef[MC.FILE];
        logger.debug(`Verifying '${file}' changelog`);
        const changelogContent = chdef[MC.CONTENT];
        const result = DBMigrationsManager.validateChangelog(changelogContent);
        if (!result.valid) {
          logger.error(`Skipping '${file}', since not in a valid format: ${JSON.stringify(result.errors)}`);
          return false;
        }
        const pendingCount = this._detectPending(chdef, dbChangesetsMap, newChangesets);
        logger.log(`Detected '${file}' changelog. Has ${pendingCount} pending changesets.`);
        if (pendingCount) {
          const changelog = changelogContent[MC.CHANGELOG];
          changelog[MC.PRECONDITIONS] = Changeset.setDefaultsForPreconditions(changelog[MC.PRECONDITIONS]);
        }
        return pendingCount;
      });
      logger.info(`Found ${this._pendingChangesetsById.size} total changesets to execute.`);
      return this._saveNewChangesets(newChangesets);
    }).then(() => this._pendingChangelogs);
  }

  _getChangesetsSummary() {
    return ChangesetHelper.findAllChangesets({}, {
      id: 1, [MC.MD5SUM]: 1, [MC.DEPLOYMENT_ID]: 1, [MC.DATE_FOUND]: 1, [MC.EXECTYPE]: 1
    }).then(chs => {
      if (this._deployemntId === undefined) {
        this._deployemntId = Math.max(0, ...chs.map(c => c[MC.DEPLOYMENT_ID])) + 1;
      }
      return chs;
    }).then(Utils.toMapByKey);
  }

  _detectPending(chdef, dbChangesetsMap: Map, newChangesets: Array) {
    const chs = chdef[MC.CONTENT][MC.CHANGELOG][MC.CHANGESETS];
    const pendingChs = [];
    const csCount = chs.filter(c => {
      const changeset = new Changeset(c, chdef);
      const dbC = dbChangesetsMap.get(changeset.id);
      let willRun = changeset.isRunAlways || !dbC || !MC.EXECTYPE_SUCCESS_OPTIONS.includes(dbC[MC.EXECTYPE]);
      if (!dbC) {
        newChangesets.push(changeset);
        changeset.dateFound = DateUtils.getISODateForAPI();
      } else if (changeset.md5 !== dbC[MC.MD5SUM]) {
        willRun = willRun || changeset.isRunOnChange;
        changeset.dateFound = dbC[MC.DATE_FOUND];
        logger.error(`${changeset.id}: MD5 mismatch detected. ${willRun ? 'It is' : 'Not'} scheduled to rerun.`);
      }
      if (willRun) {
        this._pendingChangesetsById.set(changeset.id, changeset);
        pendingChs.push(changeset);
        changeset.prevDBData = dbC;
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

  /**
   * @param context
   * @return {number} the number of executed changesets, not necessarily successfully
   */
  run(context: string) {
    if (!ElectronApp.IS_RUN_CHANGELOGS) {
      logger.warn('Skiping changelog run. Remove RUN_CHANGELOGS env var or set it to 1 to enable migrations. ');
      return Promise.resolve(0);
    }
    logger.log(`Running DB changelogs for '${context}' context`);
    if (!MC.CONTEXT_OPTIONS.includes(context)) {
      logger.error('Invalid context. Skipping.');
      return Promise.resolve(0);
    }
    this._contextWarpper.context = context;
    return this.detectAndValidateChangelogs()
      .then(pendingChangelogs => this._runChangelogs(pendingChangelogs, context))
      .then(() => {
        logger.log('DB changelogs execution complete');
        return this._executedChangesetIds.size;
      });
  }

  _runChangelogs(pendingChangelogs: Array, context: string) {
    return pendingChangelogs.reduce((prevPromise, chdef) => {
      const changelog = chdef[MC.CONTENT][MC.CHANGELOG];
      const fileName = chdef[MC.FILE];
      const chs = this._pendingChangesetsByFile.get(fileName).filter(this._contextWarpper.matches);
      chs.forEach((c: Changeset) => {
        c.execContext = context;
      });
      return prevPromise.then(() => {
        logger.debug(`Checking '${fileName}' changelog...`);
        return this._checkPreConditions(changelog[MC.PRECONDITIONS]);
      }).then((p: PreCondition) => {
        logger.log(`Preconditions check result = ${p.status} `);
        if (p.status !== MC.EXECTYPE_PRECONDITION_SUCCESS) {
          const action = p.status === MC.EXECTYPE_PRECONDITION_FAIL ? p.onFail : p.onError;
          if (action === MC.ON_FAIL_ERROR_WARN) {
            logger.warn(`'${fileName}' execution will continue. Configured to only warn on precondition problem.`);
          } else {
            const chIds = chs.map(c => `'${c.id}'`).join(', ');
            logger.warn(`Skipping '${fileName}' with failed precondition, having pending changesets: ${chIds}.`);
            return this._saveChangesets(chs, { [MC.EXECTYPE]: p.status });
          }
        }
        return this._runChangesets(chs);
      });
    }, Promise.resolve());
  }

  _checkPreConditions(preconditions) {
    if (preconditions && preconditions.length) {
      logger.log('Running preconditions check...');
      return preconditions.reduce(
        (prevPromise, precondition) => prevPromise.then((prevP: PreCondition) => {
          let isCheckNext = prevP === undefined || prevP.status === MC.EXECTYPE_PRECONDITION_SUCCESS;
          if (!isCheckNext) {
            const action = prevP.status === MC.EXECTYPE_PRECONDITION_FAIL ? prevP.onFail : prevP.onError;
            isCheckNext = action === MC.ON_FAIL_ERROR_WARN;
          }
          if (isCheckNext) {
            return this._checkPreCondition(this._getPreconditionFunc(precondition)).then(status => {
              precondition.status = status;
              return precondition;
            });
          }
          return prevP;
        }), Promise.resolve());
    } else {
      logger.log(`No preconditions. Default preconditions result = ${MC.EXECTYPE_PRECONDITION_SUCCESS}`);
    }
    const noPrecondition = new PreCondition();
    noPrecondition.status = MC.EXECTYPE_PRECONDITION_SUCCESS;
    return noPrecondition;
  }

  _getPreconditionFunc(precondition: PreCondition) {
    if (precondition.func) {
      return precondition.func;
    }
    return () => ChangesetHelper.findChangeset({
      [MC.CHANGEID]: precondition.changeId,
      [MC.AUTHOR]: precondition.author,
      [MC.FILENAME]: precondition.file,
    }).then(dbC => !!(dbC && MC.EXECTYPE_SUCCESS_OPTIONS.includes(dbC[MC.EXECTYPE])));
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
    let isHaltChangelog = false;
    return changesets.reduce((prevPromise, changeset: Changeset) => prevPromise.then(() => {
      if (this._isFailOnError || isHaltChangelog) {
        return Promise.resolve();
      }
      logger.log(`Executing '${changeset.id}' changeset...`);
      logger.debug(`Comment: ${changeset.comment}`);
      return this._processChangesetPreconditions(changeset).then(action => {
        if (action === null) {
          this._executedChangesetIds.add(changeset.id);
          return this._runChangeset(changeset);
        }
        if (action === MC.ON_FAIL_ERROR_HALT) {
          isHaltChangelog = true;
        }
        return changeset;
      }).then(() => this._saveChangeset(changeset));
    }), Promise.resolve());
  }

  /**
   * @return {Promise<string|null>} action (if any) to perform
   */
  _processChangesetPreconditions(changeset: Changeset) {
    return Promise.resolve()
      .then(() => this._checkPreConditions(changeset.preConditions))
      .then((p: PreCondition) => {
        if (p.status !== MC.EXECTYPE_PRECONDITION_SUCCESS) {
          changeset.execType = p.status;
          let action = p.status === MC.EXECTYPE_PRECONDITION_FAIL ? p.onFail : p.onError;
          if (!MC.ON_FAIL_ERROR_CHANGESET_OPTIONS.includes(action)) {
            logger.error(`Unexpected action: ${action}. Wrong value must be detected during validation
              and default one must have been configured. May be a bug. Fallback to ${MC.DEFAULT_ON_FAIL_ERROR}`);
            action = MC.DEFAULT_ON_FAIL_ERROR;
          }
          switch (action) {
            case MC.ON_FAIL_ERROR_MARK_RAN:
              logger.warn(`Marking changeset '${changeset.id}' as executed on precondition failure.`);
              changeset.execType = MC.EXECTYPE_EXECUTED;
              break;
            case MC.ON_FAIL_ERROR_CONTINUE:
              logger.warn(`Skipping changeset '${changeset.id}' due to precondition failure. Will retry next time.`);
              break;
            case MC.ON_FAIL_ERROR_HALT:
              logger.warn(`Skipping changeset '${changeset.id}' and the remaining of the changelog.`);
              break;
            case MC.ON_FAIL_ERROR_WARN:
              logger.warn(`'${changeset.id}' execution will continue. Configured to only warn on precondition issue.`);
              action = null;
              break;
            default:
              // already tackled above
              break;
          }
          return action;
        }
        return null;
      });
  }

  _saveChangeset(changeset: Changeset) {
    // storing execution date for success and also for error to see the last attempt
    changeset.dateExecuted = DateUtils.getISODateForAPI();
    this._isFailOnError = !!(changeset.isFailOnError && changeset.error);
    return this._saveChangesets([changeset]).then(() => {
      if (this._isFailOnError) {
        const notification = new NotificationHelper({ message: 'failOnErrorMessage' });
        if (!ElectronApp.IS_TEST_MODE) {
          alert(notification.message);
          ElectronApp.forceCloseApp();
        }
      }
      return this._isFailOnError;
    });
  }

  _runChangeset(changeset: Changeset) {
    // TODO check if func or update, flag status based on result, etc
    return Promise.resolve()
      .then(changeset.change)
      .then(() => {
        logger.log(`${changeset.id} executed successfully`);
        changeset.execType = DBMigrationsManager._getSuccessExecType(changeset);
        changeset.orderExecuted = this.getAndIncOrderExecuted();
        this._pendingChangesetsById.delete(changeset.id);
        return changeset;
      })
      .catch(error => this._runRollback(changeset, error));
  }

  _runRollback(changeset, error) {
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
  }

}
