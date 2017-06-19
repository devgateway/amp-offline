import { describe, it, before } from 'mocha';
import * as CurrencyRatesHelper from '../../../app/modules/helpers/CurrencyRatesHelper';
import * as CurrencyRatesManager from '../../../app/modules/util/CurrencyRatesManager';
import * as GlobalSettingsHelper from '../../../app/modules/helpers/GlobalSettingsHelper';
import * as GSC from '../../../app/utils/constants/GlobalSettingsConstants';

const chai = require('chai');

const chaiAsPromised = require('chai-as-promised');
const currencies = require('./currencies.json');

const expect = chai.expect;

const gs1 = {};
gs1[GSC.BASE_CURRENCY_KEY] = 'XOF';
chai.use(chaiAsPromised);

const currencyFrom1 = 'USD';
const currencyTo1 = 'AUD';
const date1 = '2009-08-03';
const rate1 = 1.1937;
const rate2 = 1 / 1.1937;

const currencyFrom3 = 'EUR';
const currencyTo3 = 'USD';
const date3 = '2010-08-03';
const rate3 = 1.311914;

describe('@@ CurrencyRatesManager @@', () => {
  before(() =>
    Promise.all([CurrencyRatesHelper.replaceAllCurrencyRates(currencies),
      GlobalSettingsHelper.saveGlobalSettings(gs1)
    ])
  );
  describe('Direct rate conversion', () =>
    it('should match rate', () =>
      expect(CurrencyRatesManager.convertCurrency(currencyFrom1, currencyTo1, date1)).to.eventually.deep.equal(rate1)
    )
  );
  describe('Inverse rate convesion', () =>
    it('should match rate', () =>
      expect(CurrencyRatesManager.convertCurrency(currencyTo1, currencyFrom1, date1)).to.eventually.deep.equal(rate2)
    )
  );

  describe('Via XOF rates conversion', () =>
    it('should match rate', () =>
      expect(CurrencyRatesManager.convertCurrency(currencyFrom3, currencyTo3, date3)).to.eventually.deep.equal(rate3)
    )
  );
});
