/**
 * Created by Gabriel on 23/04/2017.
 */
import { expect } from 'chai';
import NumberUtils from '../../app/utils/NumberUtils';
import {
  GS_AMOUNT_OPTION_IN_UNITS,
  GS_AMOUNT_OPTION_IN_MILLIONS
} from '../../app/utils/constants/GlobalSettingConstants';
import { STATE_GS_NUMBERS_LOADED } from '../../app/actions/StartUpAction';
import store from '../../app/index';

const noDecimalConfig = {
  decimalSeparator: '@', // choose non-standard options to test for false negatives.
  groupSeparator: '&', // idem.
  format: '###,###',
  amountsInThousands: GS_AMOUNT_OPTION_IN_UNITS
};

const decimalConfig = {
  decimalSeparator: ' ',
  groupSeparator: '*',
  format: '###,###.##',
  amountsInThousands: GS_AMOUNT_OPTION_IN_UNITS
};

const noGroupingConfig = {
  decimalSeparator: ',',
  groupSeparator: '.',
  format: '###.#',
  amountsInThousands: GS_AMOUNT_OPTION_IN_UNITS
};

const amountInMillionsConfig = {
  decimalSeparator: '.',
  groupSeparator: ',',
  format: '###,###.##',
  amountsInThousands: GS_AMOUNT_OPTION_IN_MILLIONS
};

describe('@@ Numbertils @@', () => {
  it('should return a config', () => {
    expect(NumberUtils.getConfigFromDB())
      .to.eventually.have.all.keys('decimalSeparator', 'groupSeparator', 'format', 'amountsInThousands');
  });

  it('should convert numbers without decimals', () => {
    store.dispatch({ type: STATE_GS_NUMBERS_LOADED, actionData: noDecimalConfig });
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

  it('should convert numbers with decimals', () => {
    store.dispatch({ type: STATE_GS_NUMBERS_LOADED, actionData: decimalConfig });
    NumberUtils.createLanguage();
    expect(NumberUtils.rawNumberToFormattedString(1)).to.equal('1 00');
    expect(NumberUtils.rawNumberToFormattedString(10)).to.equal('10 00');
    expect(NumberUtils.rawNumberToFormattedString(100)).to.equal('100 00');
    expect(NumberUtils.rawNumberToFormattedString(1000)).to.equal('1*000 00');
    expect(NumberUtils.rawNumberToFormattedString(20000)).to.equal('20*000 00');
    expect(NumberUtils.rawNumberToFormattedString(300000)).to.equal('300*000 00');
    expect(NumberUtils.rawNumberToFormattedString(4000000)).to.equal('4*000*000 00');
    expect(NumberUtils.rawNumberToFormattedString(50000000)).to.equal('50*000*000 00');
  });

  it('should convert numbers without grouping', () => {
    store.dispatch({ type: STATE_GS_NUMBERS_LOADED, actionData: noGroupingConfig });
    NumberUtils.createLanguage();
    expect(NumberUtils.rawNumberToFormattedString(1)).to.equal('1,0');
    expect(NumberUtils.rawNumberToFormattedString(10)).to.equal('10,0');
    expect(NumberUtils.rawNumberToFormattedString(100)).to.equal('100,0');
    expect(NumberUtils.rawNumberToFormattedString(1000)).to.equal('1000,0');
    expect(NumberUtils.rawNumberToFormattedString(20000)).to.equal('20000,0');
    expect(NumberUtils.rawNumberToFormattedString(300000)).to.equal('300000,0');
    expect(NumberUtils.rawNumberToFormattedString(4000000)).to.equal('4000000,0');
    expect(NumberUtils.rawNumberToFormattedString(50000000)).to.equal('50000000,0');
  });

  it('should convert numbers with amounts in millions', () => {
    store.dispatch({ type: STATE_GS_NUMBERS_LOADED, actionData: amountInMillionsConfig });
    NumberUtils.createLanguage();
    expect(NumberUtils.rawNumberToFormattedString(1)).to.equal('0.00');
    expect(NumberUtils.rawNumberToFormattedString(10)).to.equal('0.00');
    expect(NumberUtils.rawNumberToFormattedString(100)).to.equal('0.00');
    expect(NumberUtils.rawNumberToFormattedString(1000)).to.equal('0.00');
    expect(NumberUtils.rawNumberToFormattedString(20000)).to.equal('0.02');
    expect(NumberUtils.rawNumberToFormattedString(300000)).to.equal('0.30');
    expect(NumberUtils.rawNumberToFormattedString(4000000)).to.equal('4.00');
    expect(NumberUtils.rawNumberToFormattedString(50000000)).to.equal('50.00');
  });
});
