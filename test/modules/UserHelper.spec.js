import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/UserHelper';

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
      expect(actions.replaceUsers([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateUser', () =>
    it('should save initial data', () =>
      expect(actions.saveOrUpdateUser(init)).to.eventually.deep.equal(init)
    )
  );

  describe('saveOrUpdateUserCollection', () =>
    it('should save user collection', () =>
      expect(actions.saveOrUpdateUserCollection(users)).to.eventually.have.lengthOf(users.length)
    )
  );

  describe('findByEmail', () =>
    it('should find user by email', () =>
      expect(actions.findByEmail('testuser@amp.org')).to.eventually.deep.equal(init)
    )
  );

  describe('findUserByExample', () =>
    it('should find user by email', () =>
      expect(actions.findUserByExample({ 'first-name': 'TEST', 'last-name': 'TEST' })).to.eventually.deep.equal(init)
    )
  );

  describe('findAllUserByExample', () =>
    it('should find user by email', () =>
      expect(actions.findAllUserByExample({ 'group-keys': { $in: ['EDT'] } })).to.eventually.deep.equal([init])
    )
  );

  describe('deleteUserById', () =>
    it('should delete user', () =>
      expect(actions.deleteUserById(init.id)).to.eventually.equal(1)
    )
  );
});
