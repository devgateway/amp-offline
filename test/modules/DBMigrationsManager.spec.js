import { after, before, describe, it } from 'mocha';
import * as m from './migrations/RequireMigrations';
import * as MC from '../../app/utils/constants/MigrationsConstants';
import DBMigrationsManager from '../../app/modules/database/migrations/DBMigrationsManager';
import ChangesetHelper from '../../app/modules/helpers/ChangesetHelper';
import prodDef from '../../app/static/db/changelog-master';
import * as languages from './migrations/templates/test-migrations-languages.json';
import { replaceLanguagesForTest } from './migrations/MigrationsTestUtils';

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

const expect = chai.expect;
chai.use(chaiAsPromised);

const prodDBMigrations = new DBMigrationsManager(m.prodChangelogs);
const changeLogsWithFile = prodDef && prodDef.length && prodDef.filter(c => !!c[MC.FILE]).length;

const getValidChangelogsCount = (dbMigMng) => dbMigMng.detectAndValidateChangelogs().then(pc => pc.length);

describe('@@ DBMigrationsManager @@', () => {
  before('clear changeset.db and prepare data', () =>
    Promise.all([
      ChangesetHelper.removeAll(),
      replaceLanguagesForTest(languages.default)
    ]));

  after('clear other data', () => replaceLanguagesForTest([]));

  describe('production master definition check', () =>
    it('should have all entries with valid file entries', () =>
      expect(changeLogsWithFile).to.equal(prodDef ? prodDef.length : -1)
    )
  );

  describe('detectAndValidateChangelogs', () => {
    it('should validate all production changelogs', () =>
      expect(getValidChangelogsCount(prodDBMigrations)).to.eventually.equal(changeLogsWithFile)
    );
    m.invalidSchema.forEach(chdef =>
      it(`should fail invalid schema changelog for ${chdef[MC.FILE]}`, () =>
        expect(getValidChangelogsCount(new DBMigrationsManager([chdef]))).to.eventually.equal(0)
      )
    );
  });

  describe('run', () => {
    m.testPreConditions.forEach(chdef =>
      it(`should pass correctly the preconditions check for ${chdef[MC.FILE]}`, () => {
        const preConditionsDBMigrations = new DBMigrationsManager([chdef]);
        return expect(preConditionsDBMigrations.run(MC.CONTEXT_STARTUP)
          .then(() => chdef.isValid(preConditionsDBMigrations)))
          .to.eventually.be.true;
      })
    );

    m.testChanges.forEach(chdef =>
      it(`should process changes correctly for ${chdef[MC.FILE]}`, () => {
        const changesDBMigrations = new DBMigrationsManager([chdef]);
        return expect(changesDBMigrations.run(MC.CONTEXT_STARTUP)
          .then(() => chdef.isValid(changesDBMigrations)))
          .to.eventually.be.true;
      })
    );

    m.runTwice.forEach(chdef =>
      it(`should process changes correctly on consecutive app startups for ${chdef[MC.FILE]}`, () => {
        let changesDBMigrations = new DBMigrationsManager([chdef]);
        return expect(changesDBMigrations.run(MC.CONTEXT_STARTUP)
          .then(() => chdef.isValid(changesDBMigrations, true))
          .then(r1 => {
            changesDBMigrations = new DBMigrationsManager([chdef]);
            return changesDBMigrations.run(MC.CONTEXT_STARTUP)
              .then(() => chdef.isValid(changesDBMigrations, false))
              .then(r2 => [r1, r2]);
          })).to.eventually.be.deep.equal([true, true]);
      })
    );

    m.testContext.forEach(chdef => {
      const contextDBMigrations = new DBMigrationsManager([chdef]);
      MC.CONTEXT_BY_ORDER.forEach(context =>
        it(`should match context rules correctly for ${chdef[MC.FILE]} at '${context}'`, () =>
          expect(contextDBMigrations.run(context).then(() => chdef.isValid(contextDBMigrations))).to.eventually.be.true
        )
      );
    });

    m.testRollback.forEach(chdef =>
      it(`should process rollback correctly for ${chdef[MC.FILE]}`, () => {
        const changesDBMigrations = new DBMigrationsManager([chdef]);
        return expect(changesDBMigrations.run(MC.CONTEXT_STARTUP)
          .then(() => chdef.isValid(changesDBMigrations)))
          .to.eventually.be.true;
      })
    );

    m.otherRules.forEach(chdef =>
      it(`should process rules correctly for ${chdef[MC.FILE]}`, () => {
        const rulesDBMigrations = new DBMigrationsManager([chdef]);
        return expect(rulesDBMigrations.run(MC.CONTEXT_STARTUP)
          .then(() => chdef.isValid(rulesDBMigrations)))
          .to.eventually.be.true;
      })
    );
  });
});
