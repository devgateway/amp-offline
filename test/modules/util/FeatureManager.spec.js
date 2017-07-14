import { describe, it } from 'mocha';
import actions from '../../../app/modules/util/FeatureManager';

const chai = require('chai');

const expect = chai.expect;

const fmTree = {
  'PROJECT MANAGEMENT': {
    __enabled: true,
    Funding: {
      __enabled: true,
      'Funding Information': {
        __enabled: false,
        'Delivery rate': {
          __enabled: true
        }
      }
    }
  }
};

const FM_PATH = '/PROJECT MANAGEMENT/Funding/Funding Information/Delivery rate';

describe('@@ FeatureManager @@', () => {
  describe('_isFMSettingEnabled', () =>
    it('should report Delivery Rate is disabled when full path is checked', () =>
      expect(actions._isFMSettingEnabled(FM_PATH, false, fmTree)).to.be.false
    )
  );

  describe('_isFMSettingEnabled', () =>
    it('should report Delivery Rate is enabled when only last segment must be checked', () =>
      expect(actions._isFMSettingEnabled(FM_PATH, true, fmTree)).to.be.true
    )
  );
});
