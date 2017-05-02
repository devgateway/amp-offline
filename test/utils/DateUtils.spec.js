/**
 * Created by Anya on 28/04/2017.
 */
import { expect } from 'chai';
import DateUtils from '../../app/utils/DateUtils';
import { STATE_GS_DATE_LOADED } from '../../app/actions/StartUpAction';
import store from '../../app/index';

const defaultDateConfig = {
  dateFormat: 'DD/MM/YYYY'
};

describe('@@ DateUtils @@', () => {
  it('should return a config', () => {
    expect(DateUtils.getConfigFromDB())
      .to.have.property('dateFormat');
  });

  it('should convert a timestamp to a simple formatted date', () => {
    store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: defaultDateConfig });
    expect(DateUtils.createFormattedDate('2015-02-04T12:06:32.000+0000')).to.equal('04/02/2015');
  });

  it('should do nothing with an invalid date', () => {
    store.dispatch({ type: STATE_GS_DATE_LOADED, actionData: defaultDateConfig });
    expect(DateUtils.createFormattedDate('not a date')).to.equal('not a date');
  });
});
