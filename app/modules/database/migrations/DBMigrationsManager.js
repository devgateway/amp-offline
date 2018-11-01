/* eslint-disable class-methods-use-this */
import { Validator } from 'jsonschema';
import Logger from '../../util/LoggerManager';
import changelogs from '../../../static/db/changelog-master';
import * as MC from '../../../utils/constants/MigrationsConstants';
import Changeset from './Changeset';
import ChangelogSchema from './schema/ChangelogSchema';

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

  detectAndValidateChangelogs() {
    // TODO full solution, for now quick POC implementation
    return changelogs.filter(chdef => {
      logger.debug(`Verifying '${chdef[MC.FILE]}' changelog`);
      const changelog = chdef[MC.CONTENT];
      const result = DBMigrationsManager.validateChangelog(changelog);
      if (!result.valid) {
        logger.error(`Skipping '${chdef[MC.FILE]}', since not in a valid format: ${JSON.stringify(result.errors)}`);
        return false;
      }
      // TODO check if any changeset still needs to be executed and report those as detected
      logger.log(`Detected '${chdef[MC.FILE]}' changelog to execute`);
      return true;
    });
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
        logger.log(`Executing '${chdef[MC.FILE]}' changelog...`);
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
