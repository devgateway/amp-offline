/**
 * Created by Anya on 28/04/2017.
 */
import { expect } from 'chai';
import DateUtils from '../../app/utils/DateUtils';
import { STATE_GS_DATE_LOADED } from '../../app/actions/StartUpAction';
import store from '../../app/index';

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
  it('should return a config', () => {
    expect(DateUtils.getConfigFromDB())
      .to.eventually.have.property('dateFormat');
  });

  it('should convert a timestamp to the config DD/MM/YYYY', () => {
    store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: defaultDateConfig });
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('04/02/2015');
  });

  it('should convert a timestamp to the config DD/MMM/YYYY', () => {
    store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: altDateConfig1 });
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('04/Feb/2015');
  });

  it('should convert a timestamp to the config MM/DD/YYYY', () => {
    store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: altDateConfig2 });
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('02/04/2015');
  });

  it('should convert a timestamp to the  config MMM/DD/YYYY', () => {
    store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: altDateConfig3 });
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('Feb/04/2015');
  });

  it('should do nothing with an invalid date', () => {
    store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: defaultDateConfig });
    expect(DateUtils.createFormattedDate('not a date')).to.equal('not a date');
  });
});
