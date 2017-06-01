import { describe, it } from 'mocha';
import * as helper from '../../app/modules/helpers/CurrencyRatesHelper';
import { removeIdFromCollection } from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const currencyRatesArray = [{
  rates: [{ date: '2017-05-29', rate: 2 }],
  'currency-pair': { from: 'XOF', to: 'ARS' },
  id: '3354237812-1496146341131-0.11163444056235194'
}];
const xofToArs = {
  rates: [{ date: '2017-05-29', rate: 2 }],
  'currency-pair': { from: 'ARS', to: 'XOF' },
  id: '3354237812-1496146341131-0.11163444056235195'
};
describe('@@ CurrencyRatesHelper @@', () => {
  describe('saveCurrencyRate', () =>
    it('should save Global Setting data', () =>
      expect(helper.saveCurrencyRate(xofToArs)).to.eventually.deep.equal(xofToArs)
    )
  );
  describe('findByFromAndTo', () =>
    it('should find Global Setting data', () =>
      expect(helper.findByFromAndTo('ARS', 'XOF')).to.eventually.deep.equal(xofToArs)
    )
  );

  describe('SaveCurrencyRates', () =>
    it('should save currencyRates data', (done) => {
      helper.replaceAllCurrencyRates(currencyRatesArray).then((currencyRates) => {
        const response = removeIdFromCollection(currencyRates);
        expect(response).to.eql(currencyRatesArray);
        return done();
      }).catch(error => done(error));
    })
  );
});
