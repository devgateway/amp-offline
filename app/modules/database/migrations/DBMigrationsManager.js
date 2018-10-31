/* eslint-disable class-methods-use-this */
import md5 from 'js-md5';
import Logger from '../../util/LoggerManager';
import changelogs from '../../../static/db/changelog-master';
import * as MC from '../../../utils/constants/MigrationsConstants';
import Changeset from './Changeset';

const logger = new Logger('DB Migrations Manager');

/**
 * Database Migrations Manager for patching DB with pending changesets available under "static/db/changelog" folder
 *
 * @author Nadejda Mandrescu
 */
class DBMigrationsManager {
  detectAndValidateChangelogs() {
    // TODO full solution, for now quick POC implementation
    return changelogs.map(chdef => {
      logger.log(`Detected '${chdef[MC.FILE]}' changelog`);
      return chdef;
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
    let md5checked = false;
    // TODO full implementation
    return changesets.reduce((prevPromise, changeset) => prevPromise.then(() => {
      changeset = new Changeset(changeset, chdef);
      logger.log(`Executing '${changeset.id}' changeset...`);
      logger.debug(`Comment: ${changeset.comment}`);
      const chJSON = JSON.stringify(changeset);
      const chJSONMd5 = md5(chJSON);
      if (!md5checked && chJSONMd5 !== changeset.getMd5()) {
        logger.error('MD5 doesn\'t match!');
      }
      md5checked = true;
      logger.debug(`chJSONMd5 = ${chJSONMd5}`);
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
