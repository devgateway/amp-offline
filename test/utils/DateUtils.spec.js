/**
 * Created by Anya on 28/04/2017.
 */
import { expect } from 'chai';
import { GlobalSettingsConstants } from 'amp-ui';
import DateUtils from '../../app/utils/DateUtils';
import GlobalSettingsManager from '../../app/modules/util/GlobalSettingsManager';
import NotificationHelper from '../../app/modules/helpers/NotificationHelper';

const defaultDateConfig = {
  dateFormat: 'dd/MM/yyyy'
};

const altDateConfig1 = {
  dateFormat: 'dd/MMM/yyyy'
};

const altDateConfig2 = {
  dateFormat: 'MM/dd/yyyy'
};

const altDateConfig3 = {
  dateFormat: 'MMM/dd/yyyy'
};

describe('@@ DateUtils @@', () => {
  it('should convert a timestamp to the config DD/MM/YYYY', () => {
    GlobalSettingsManager.setGlobalSettings(GlobalSettingsManager.buildGS(defaultDateConfig));
    DateUtils.setGSDateFormat(GlobalSettingsManager.getSettingByKey(
      GlobalSettingsConstants.DEFAULT_DATE_FORMAT).toUpperCase());
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('04/02/2015');
  });

  it('should convert a timestamp to the config DD/MMM/YYYY', () => {
    GlobalSettingsManager.setGlobalSettings(GlobalSettingsManager.buildGS(altDateConfig1));
    DateUtils.setGSDateFormat(GlobalSettingsManager.getSettingByKey(
      GlobalSettingsConstants.DEFAULT_DATE_FORMAT).toUpperCase());
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('04/Feb/2015');
  });

  it('should convert a timestamp to the config MM/DD/YYYY', () => {
    GlobalSettingsManager.setGlobalSettings(GlobalSettingsManager.buildGS(altDateConfig2));
    DateUtils.setGSDateFormat(GlobalSettingsManager.getSettingByKey(
      GlobalSettingsConstants.DEFAULT_DATE_FORMAT).toUpperCase());
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('02/04/2015');
  });

  it('should convert a timestamp to the  config MMM/DD/YYYY', () => {
    GlobalSettingsManager.setGlobalSettings(GlobalSettingsManager.buildGS(altDateConfig3));
    DateUtils.setGSDateFormat(GlobalSettingsManager.getSettingByKey(
      GlobalSettingsConstants.DEFAULT_DATE_FORMAT).toUpperCase());
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('Feb/04/2015');
  });

  it('should throw an error for an invalid date', () => {
    GlobalSettingsManager.setGlobalSettings(GlobalSettingsManager.buildGS(defaultDateConfig));
    DateUtils.setGSDateFormat(GlobalSettingsManager.getSettingByKey(
      GlobalSettingsConstants.DEFAULT_DATE_FORMAT).toUpperCase());
    expect(DateUtils.createFormattedDate.bind(null, 'not a date')).to.throw(NotificationHelper);
  });

  it('should return same date format', () => {
    GlobalSettingsManager.setGlobalSettings(GlobalSettingsManager.buildGS(defaultDateConfig));
    DateUtils.setGSDateFormat(GlobalSettingsManager.getSettingByKey(
      GlobalSettingsConstants.DEFAULT_DATE_FORMAT).toUpperCase());
    expect(DateUtils.getGSDateFormat()).to.equal(defaultDateConfig.dateFormat.toUpperCase());
  });
});
