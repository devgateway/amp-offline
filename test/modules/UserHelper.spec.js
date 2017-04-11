import { describe, it } from 'mocha';
import UserHelper from '../../app/modules/helpers/UserHelper';
import { removeIdFromCollection } from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const init = {
  id: 7,
  email: 'testuser@amp.org',
  'first-name': 'TEST',
  'last-name': 'TEST',
  'is-banned': false,
  'is-active': false,
  'is-pledger': false,
  'is-admin': false,
  'lang-iso2': 'fr',
  'country-iso2': 'us',
  'org-type-id': 4,
  'org-group-id': 35,
  'org-id': 80,
  'group-keys': [
    'EDT',
    'MEM',
    'TRN'
  ]
};
const users = [init, { id: 1 }, { id: 2 }];

describe('@@ UserHelper @@', () => {
  describe('replaceUsers', () =>
    it('should clear data', () =>
      expect(UserHelper.replaceUsers([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateUser', () =>
    it('should save initial data', () =>
      expect(UserHelper.saveOrUpdateUser(init)).to.eventually.deep.equal(init)
    )
  );

  describe('saveOrUpdateUserCollection', () =>
    it('should save the Workspaces data', (done) => {
      UserHelper.saveOrUpdateUserCollection(users).then((resultUsers) => {
        expect(removeIdFromCollection(resultUsers)).to.eql(users);
        return done();
      }).catch(error => done(error));
    })
  );

  describe('findByEmail', () =>
    it('should find user by email', () =>
      expect(UserHelper.findByEmail('testuser@amp.org')).to.eventually.deep.equal(init)
    )
  );

  describe('findUserByExample', () =>
    it('should find user by email', () =>
      expect(UserHelper.findUserByExample({ 'first-name': 'TEST', 'last-name': 'TEST' })).to.eventually.deep.equal(init)
    )
  );

  describe('findAllUserByExample', () =>
    it('should find user by email', () =>
      expect(UserHelper.findAllUsersByExample({ 'group-keys': { $in: ['EDT'] } })).to.eventually.deep.equal([init])
    )
  );

  describe('deleteUserById', () =>
    it('should delete user', () =>
      expect(UserHelper.deleteUserById(init.id)).to.eventually.equal(1)
    )
  );
});
