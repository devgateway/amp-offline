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

const logger = new Logger('DB Migrations Manager');

const validator = new Validator();
validator.addSchema(ChangelogSchema, '/ChangelogSchema');


/**
 * Database Migrations Manager for patching DB with pending changesets available under "static/db/changelog" folder
 *
 * @author Nadejda Mandrescu
 */
class DBMigrationsManager {
  static validateChangelog(changelog) {
    return validator.validate(changelog, ChangelogSchema);
  }

  constructor() {
    this._executedChangesetIds = new Set();
    this._pendingChangesetsById = new Map();
    this._pendingChangelgs = undefined;
    this._deployemntId = undefined;
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
    const files = new Set(this._pendingChangesetsById.values().map((c:Changeset) => c.filename));
    this._pendingChangelgs = this._pendingChangelgs.filter(cl => files.has(cl[MC.FILE]));
    return Promise.resolve().then(() => this._pendingChangelgs);
  }

  _detectAllValidAndPendingChangelogs() {
    return this._getChangesetsSummary().then((dbChangesetsMap:Map) => {
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
        return pendingCount;
      });
      logger.info(`Found ${this._pendingChangesetsById.size} total changesets to execute.`);
      return this._saveNewChangesets(newChangesets);
    }).then(() => this._pendingChangelgs);
  }

  _getChangesetsSummary() {
    return ChangesetHelper.findAllChangesets({}, { id: 1, [MC.MD5SUM]: 1, [MC.DEPLOYMENT_ID]: 1 })
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
    return chs.filter(c => {
      const changeset = new Changeset(c, chdef);
      const dbC = dbChangesetsMap.get(changeset.id);
      let willRun = changeset.isRunAlways || !dbC;
      if (!dbC) {
        newChangesets.push(changeset);
      } else if (changeset.md5 !== c[MC.MD5SUM]) {
        willRun = willRun || changeset.isRunOnChange;
        logger.error(`${changeset.id}: MD5 mismatch detected. ${willRun ? 'It is' : 'Not'} scheduled to rerun.`);
      }
      if (willRun) {
        this._pendingChangesetsById.set(changeset.id, changeset);
        return true;
      }
      return false;
    }).length;
  }

  _saveNewChangesets(newChangesets: Array) {
    if (!newChangesets.length) {
      return Promise.resolve();
    }
    const template = {
      [MC.DEPLOYMENT_ID]: this._deployemntId,
      [MC.DATE_FOUND]: DateUtils.getISODateForAPI(),
    };
    const dbcs = newChangesets.map(c => ChangesetHelper.changesetToDBFormat(c, template));
    return ChangesetHelper.saveOrUpdateChangesetCollection(dbcs);
  }

  run(context: string) {
    logger.log(`Running DB changelogs for '${context}' context`);
    if (!MC.CONTEXT_OPTIONS.includes(context)) {
      logger.error('Invalid context. Skipping.');
      return Promise.resolve();
    }
    return this.detectAndValidateChangelogs().reduce((prevPromise, chdef) => {
      const changelog = chdef[MC.CONTENT][MC.CHANGELOG];
      return prevPromise.then(() => {
        // TODO the full solution
        logger.log(`Checking '${chdef[MC.FILE]}' changelog...`);
        return this._checkPreConditions(changelog[MC.PRECONDITIONS]);
      }).then(preconditionsPass => {
        if (!preconditionsPass) {
          logger.log(`Skipping '${chdef[MC.FILE]}' changelog, since preconditions not matched.`);
          // TODO flag changesets
          return Promise.resolve();
        }
        return this._runChangesets(changelog[MC.CHANGESETS], chdef);
      });
    }, Promise.resolve()).then(() => {
      logger.log('DB changelogs execution complete');
      return Promise.resolve();
    });
  }

  _checkPreConditions(preconditions) {
    // eslint-disable-next-line prefer-const
    let preconditionsPass = true;
    Changeset.setDefaultsForPreconditions(preconditions);
    if (preconditions && preconditions.length) {
      logger.log('Running preconditions check...');
      // TODO actual preconditions check
      logger.log(`Preconditions check pass = ${preconditionsPass.toString().toUpperCase()} `);
    } else {
      logger.log('No preconditions');
    }
    return preconditionsPass;
  }

  _runChangesets(changesets, chdef) {
    // TODO full implementation
    return changesets.reduce((prevPromise, changeset) => prevPromise.then(() => {
      changeset = new Changeset(changeset, chdef);
      logger.log(`Executing '${changeset.id}' changeset...`);
      logger.debug(`Comment: ${changeset.comment}`);
      logger.debug(`md5 = ${changeset.md5}`);
      if (changeset.md5 !== changeset.tmpGetDBMd5()) {
        logger.error('MD5 doesn\'t match!');
      }
      // TODO check if func or update, flag status based on result, etc
      return Promise.resolve().then(changeset.change)
        .then((result) => {
          logger.log('Execution successful');
          return result;
        })
        .catch(error => {
          logger.error(`Execution unsuccessful: ${error}`);
          if (changeset[MC.ROLLBACK]) {
            logger.log('Executing the rollback');
            return Promise.resolve().then(changeset[MC.ROLLBACK]).catch(err => {
              logger.error(`Rollback execution failed: ${err}`);
              return Promise.resolve();
            });
          }
          return Promise.resolve();
        });
    }), Promise.resolve());
  }

}

const dbMigrationsManager = new DBMigrationsManager();

export default dbMigrationsManager;
