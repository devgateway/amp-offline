import { describe, it } from 'mocha';
import { FeatureManager } from 'amp-ui';
import LoggerManager from '../../../app/modules/util/LoggerManager';

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
FeatureManager.setFMTree(fmTree);
FeatureManager.setLoggerManager(LoggerManager);
const FM_PATH = '/PROJECT MANAGEMENT/Funding/Funding Information/Delivery rate';

describe('@@ FeatureManager @@', () => {
  describe('isFMSettingEnabled', () =>
    it('should report "Delivery rate" is disabled when full path is checked', () =>
      expect(FeatureManager.isFMSettingEnabled(FM_PATH, false, fmTree)).to.be.false
    )
  );
  describe('isFMSettingEnabled', () =>
    it('should report "Delivery rate" is enabled when only last segment must be checked', () =>
      expect(FeatureManager.isFMSettingEnabled(FM_PATH, true, fmTree)).to.be.true
    )
  );
});
