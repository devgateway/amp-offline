import * as actions from '../../app/modules/helpers/ClientSettingsHelper';
import {INVALID_FORMAT} from '../../app/modules/helpers/ClientSettingsHelper';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


const validSetting = {id: "_testSettingId1_", name: "AMP Offline Client Enabled",
  description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
  visible: false, type: "boolean", options: [false, true], value: 12,
  "updated-at": undefined
};

const validSettingNoOptions = {id: "_testSettingId10_", name: "Number free text setting",
  description: "Testing no options",  visible: false, type: "number", value: 50, "updated-at": undefined
};
const invalidSettings = [
  {
    id: "_testSettingId2_", nume: "AMP Offline Client Enabled",
    description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
    vizibil: false, type: "bool", options: ["fals", "adevarat"], value: "adevarat",
    "updated-at": 123
  },
  {
    id: "_testSettingId3_", name: "AMP Offline Client Enabled",
    description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
    visible: false, type: Boolean, options: [false, true], value: true,
    "updated-at": 123
  },
  {
    id: "_testSettingId4_", name: "AMP Offline Client Enabled",
    description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
    visible: false, type: Boolean, options: [false, true], value: "adevarat",
    "updated-at": undefined
  },
  {
    id: "_testSettingId5_", name: "AMP Offline Client Enabled",
    description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
    visible: false, type: Boolean, options: ["fals", "adevarat"], value: true,
    "updated-at": undefined
  },
  // {
  //   id: "_testSettingId6_", name: "AMP Offline Client Enabled",
  //   description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
  //   visible: false, type: "bool", options: [false, true], value: true,
  //   "updated-at": undefined
  // },
  {
    id: "_testSettingId7_", name: "AMP Offline Client Enabled",
    description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
    vizibil: false, type: Boolean, options: [false, true], value: true,
    "updated-at": undefined
  },
  {
    id: "_testSettingId8_", nume: "AMP Offline Client Enabled",
    description: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
    visible: false, type: Boolean, options: [false, true], value: true,
    "updated-at": undefined
  },
  {
    id: "_testSettingId9_", name: "AMP Offline Client Enabled",
    desc: "Clarifies if the AMP Offline client can still be used, controlled at AMP server",
    visible: false, type: Boolean, options: [false, true], value: true,
    "updated-at": undefined
  }];


describe('@@ ClientSettingsHelper @@', () => {
  //positive
  it('func saveOrUpdateSetting - Should save the valid setting', (done) => {
    expect(actions.saveOrUpdateSetting(validSetting)).to.eventually.deep.equal(validSetting).notify(done);
  });

  it('func saveOrUpdateSetting - Should save the valid setting', (done) => {
    expect(actions.saveOrUpdateSetting(validSettingNoOptions)).to.eventually.deep.equal(validSettingNoOptions).notify(done);
  });

  it('func findSettingById - Should find the exact setting by id', (done) => {
    expect(actions.findSettingById(validSetting.id)).to.eventually.deep.equal(validSetting).notify(done);
  });

  it('func findAllVisibleSettings - Should find none visible', (done) => {
    expect(actions.findAllVisibleSettings()).to.deep.equal({}).notify(done);
  });

  it('func findSettingById - Should provide a different "updated-at" value than the previous one', (done) => {
    validSetting["updated-at"] = undefined;
    actions.findSettingById(validSetting.id).then((setting) => {
      expect(setting["updated-at"]).to.not.equal(validSetting["updated-at"]);
      done();
    }).catch(error => done(error));
  });

  it('func deleteById - Should delete the setting data', (done) => {
    expect(actions.deleteById(validSetting.id)).to.eventually.equal(1);
    expect(actions.deleteById(validSettingNoOptions.id)).to.eventually.equal(1).notify(done);
  });

  //negative
  invalidSettings.forEach(is => {
    console.log('invalidSetting.id = ' + is.id);
    it('func saveOrUpdateSetting - Should throw invalid format error for an invalid setting to be saved', (done) => {
      expect(actions.saveOrUpdateSetting(is)).to.be.rejectedWith(INVALID_FORMAT).notify(done);
    });
  });

});
