/**
 * Created by Gabriel on 23/04/2017.
 */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import NumberUtils from '../../app/utils/NumberUtils';
import { GS_AMOUNT_OPTION_IN_UNITS } from '../../app/utils/constants/GlobalSettingConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const noDecimalConfig = {
  decimalSeparator: '@', // choose non-standar options to test for false negatives.
  groupSeparator: '&', // idem.
  format: '###.###',
  amountsInThousands: GS_AMOUNT_OPTION_IN_UNITS
};

describe('@@ Numbertils @@', () => {
  it('should return a config', () => {
    expect(NumberUtils.getConfigFromDB())
      .to.eventually.have.property('decimalSeparator', 'groupSeparator', 'format', 'amountsInThousands');
  });

  it('should convert numbers', () => {
    const store = mockStore([{ syncUp: { gsNumberData: noDecimalConfig } }]);
    NumberUtils.createLanguage();
    expect(NumberUtils.rawNumberToFormattedString(1)).to.equal('1');
    expect(NumberUtils.rawNumberToFormattedString(10)).to.equal('10');
    expect(NumberUtils.rawNumberToFormattedString(100)).to.equal('100');
    expect(NumberUtils.rawNumberToFormattedString(1000)).to.equal('1&000');
    expect(NumberUtils.rawNumberToFormattedString(20000)).to.equal('20&000');
    expect(NumberUtils.rawNumberToFormattedString(300000)).to.equal('300&000');
    expect(NumberUtils.rawNumberToFormattedString(4000000)).to.equal('4&000&000');
    expect(NumberUtils.rawNumberToFormattedString(50000000)).to.equal('50&000&000');
  });
});
