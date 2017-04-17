/* NOTICE: These tests run on electron-mocha to have access to the rendering process (not main process). */
import { describe, it } from 'mocha';
import Auth from '../../../app/modules/security/Auth';
import { DIGEST_ALGORITHM_SHA1 } from '../../../app/utils/Constants';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('@@ Auth @@', () => {
  describe('sha', () =>
    it('should return correct value', () =>
      expect(Auth.sha('password', DIGEST_ALGORITHM_SHA1))
        .to.eventually.deep.equal('5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8')
    )
  );
});
