import { describe, it } from 'mocha';
import changelogs from './migrations/RequireMigrations';
import * as MC from '../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../app/modules/database/migrations/DBMigrationsManager';

const prodDBMigrations = new DBMigrationsManager(changelogs);

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const expect = chai.expect;
chai.use(chaiAsPromised);

const changeLogsWithFile = changelogs && changelogs.length && changelogs.filter(c => !!c[MC.FILE]).length;

describe('@@ DBMigrationsManager @@', () => {
  // TODO clear DB
  describe('master definition check', () =>
    it('should have all entries with valid file entries', () =>
      expect(changeLogsWithFile).to.equal(changelogs ? changelogs.length : -1)
    )
  );

  describe('detectAndValidateChangelogs', () =>
    it('should validate all production changelogs', () =>
      expect(prodDBMigrations.detectAndValidateChangelogs().then(pc => pc.length))
        .to.eventually.equal(changeLogsWithFile)
    )
  );
});
