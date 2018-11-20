import { before, describe, it } from 'mocha';
import * as m from './migrations/RequireMigrations';
import * as MC from '../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../app/modules/database/migrations/DBMigrationsManager';
import ChangesetHelper from '../../app/modules/helpers/ChangesetHelper';
import prodDef from '../../app/static/db/changelog-master';

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const expect = chai.expect;
chai.use(chaiAsPromised);

const prodDBMigrations = new DBMigrationsManager(m.prodChangelogs);
const changeLogsWithFile = prodDef && prodDef.length && prodDef.filter(c => !!c[MC.FILE]).length;

describe('@@ DBMigrationsManager @@', () => {
  before('clear changeset.db', () => ChangesetHelper.removeAll());

  describe('production master definition check', () =>
    it('should have all entries with valid file entries', () =>
      expect(changeLogsWithFile).to.equal(prodDef ? prodDef.length : -1)
    )
  );

  describe('detectAndValidateChangelogs', () =>
    it('should validate all production changelogs', () =>
      expect(prodDBMigrations.detectAndValidateChangelogs().then(pc => pc.length))
        .to.eventually.equal(changeLogsWithFile)
    )
  );
});
