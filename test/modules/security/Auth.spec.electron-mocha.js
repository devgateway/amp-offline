/* NOTICE: These tests run on electron-mocha to have access to the rendering process (not main process). */
import { describe, it } from 'mocha';
import Auth from '../../../app/modules/security/Auth';
import { DIGEST_ALGORITHM_SHA1, AKEY, HASH_ITERATIONS } from '../../../app/utils/Constants';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const password = 'password';

describe('@@ Auth @@', () => {
  describe('sha', () =>
    it('should return correct value', () =>
      expect(Auth.sha(password, DIGEST_ALGORITHM_SHA1))
        .to.eventually.deep.equal('5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8')
    )
  );

  describe('secureHash', () =>
    it('should return correct value', () =>
      expect(Auth.secureHash(password, AKEY, HASH_ITERATIONS))
        .to.eventually.deep.equal('b84eb4e070d92befe8d0af2ffdce675cc903027ea36e01ad96f26df9c1075995')
    )
  );
});
