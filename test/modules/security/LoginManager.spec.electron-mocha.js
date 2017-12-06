/* NOTICE: These tests run on electron-mocha to have access to the rendering process (not main process). */
import { describe, it } from 'mocha';
import LoginManager from '../../../app/modules/security/LoginManager';
import UserHelper from '../../../app/modules/helpers/UserHelper';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const password = 'password';
const userName = 'testuser@amp.org';
const wrongPass = 'bla';
const user = {
  id: 99,
  email: userName,
  'first-name': 'TEST',
  'last-name': 'TEST',
  ampOfflinePassword: 'b84eb4e070d92befe8d0af2ffdce675cc903027ea36e01ad96f26df9c1075995'
};

describe('@@ LoginManager @@', () => {
  before(() => (
    UserHelper.saveOrUpdateUser(user)
  ));

  after(() => (
    UserHelper.deleteUserById(user.id)
  ));

  describe('processLogin', () => {
    it('should fail offline login due to wrong user/pass', () =>
      expect(LoginManager.processLogin(userName, wrongPass, false))
        .to.eventually.be.rejected
    );

    it('should succeed offline login', () =>
      expect(LoginManager.processLogin(userName, password, false))
        .to.eventually.deep.equal({ dbUser: user })
    );

    it('should clear credentials', () => {
      const user2 = user;
      delete user2.ampOfflinePassword;
      return expect(LoginManager.clearCredentialsInDB(userName))
        .to.eventually.deep.equal(user2);
    });
  });
});
