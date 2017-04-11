import { describe, it } from 'mocha';
import * as helper from '../../app/modules/helpers/GlobalSettingsHelper';
import { stringToId, removeIdFromCollection } from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);


const id1 = stringToId('AMP_GLOBAL_SETTING_12');
const gs1 = { AMP_GLOBAL_SETTING_12: 'AMP_GLOBAL_SETTING_12' };
const gs1Output = { key: 'AMP_GLOBAL_SETTING_12', value: 'AMP_GLOBAL_SETTING_12', id: id1 }

const gsArrayInput = [{ AMP_GLOBAL_SETTING_1: 'AMP_GLOBAL_SETTING_1' },
  { AMP_GLOBAL_SETTING_2: 'AMP_GLOBAL_SETTING_2' }];
const gsArrayOut = [{ key: '0', value: { AMP_GLOBAL_SETTING_1: 'AMP_GLOBAL_SETTING_1' }, id: stringToId('0') },
  { key: '1', value: { AMP_GLOBAL_SETTING_2: 'AMP_GLOBAL_SETTING_2' }, id: stringToId('1') }];


describe('@@ GlobalSettingsHelper @@', () => {
  describe('saveGlobalSetting', () =>
    it('should save Global Setting data', () =>
      expect(helper.saveGlobalSetting(gs1)).to.eventually.deep.equal(gs1Output)
    )
  );
  describe('findById', () =>
    it('should find the GlobalSetting data', () =>
      expect(helper.findById(id1)).to.eventually.deep.equal(gs1Output)
    )
  );

  describe('findByKey', () =>
    it('should find the GlobalSetting data', () =>
      expect(helper.findByKey('AMP_GLOBAL_SETTING_12')).to.eventually.deep.equal(gs1Output)
    )
  );

  describe('deleteById', () =>
    it('should delete test gs data', () =>
      expect(helper.deleteById(id1)).to.eventually.equal(1)
    )
  );
  describe('saveGlobalSettings', () =>
    it('should save Global Settings data', (done) => {
      helper.saveGlobalSettings(gsArrayInput).then((globalSettings) => {
        const resultado = removeIdFromCollection(globalSettings);
        expect(resultado).to.eql(gsArrayOut);
        return done();
      }).catch(error => done(error));
    })
  );
});
