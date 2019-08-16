import { describe, it } from 'mocha';
import { CurrencyRatesManager } from 'amp-ui';
import translate from '../../../app/utils/translate';
import DateUtils from '../../../app/utils/DateUtils';
import * as ErrorNotificationHelper from '../../../app/modules/helpers/ErrorNotificationHelper';

import * as GSC from '../../../app/utils/constants/GlobalSettingsConstants';

const chai = require('chai');

const chaiAsPromised = require('chai-as-promised');
const currencies = require('./currencies.json');

const expect = chai.expect;

const currencyRatesManager = new CurrencyRatesManager(currencies, 'XOF', translate, DateUtils,
  ErrorNotificationHelper);

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
  describe('Direct rate conversion', () =>
    it('should match rate', () =>
      expect(currencyRatesManager.convertCurrency(currencyFrom1, currencyTo1, date1)).to.eql(rate1)
    )
  );
  describe('Inverse rate convesion', () =>
    it('should match rate', () =>
      expect(currencyRatesManager.convertCurrency(currencyTo1, currencyFrom1, date1)).to.eql(rate2)
    )
  );

  describe('Via XOF rates conversion', () =>
    it('should match rate', () =>
      expect(currencyRatesManager.convertCurrency(currencyFrom3, currencyTo3, date3)).to.eql(rate3)
    )
  );
});
