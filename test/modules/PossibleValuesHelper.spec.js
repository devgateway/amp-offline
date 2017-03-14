import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/PossibleValuesHelper';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const pv1 = {
  id: 'donor_organization~organization',
  'possible-options': [
    {
      id: 1,
      value: 'African Capacity Building Foundation'
    },
    {
      id: 2,
      'parent-id': 1,
      value: 'Agence Canadienne pour le Développement International'
    }
  ]
};
const pv2 = {
  id: 'executing_agency~organization',
  'possible-options': [
    {
      id: 3,
      value: 'Agence Française de Développement'
    },
    {
      id: 4,
      value: "Agence internationale de l'Energie Atomique"
    }
  ]
};
const pvTranslations = {
  id: 'beneficiary_agency~organization',
  'possible-options': [
    {
      id: 3,
      value: {
        en: 'Agence Française de Développement'
      }
    },
    {
      id: 4,
      value: {
        en: 'Agence internationale de l\'Energie Atomique'
      }
    }
  ]
};

const validPossibleValuesColl = [pv1, pv2, pvTranslations];
const invalidPV = { id: 'some-id', 'invalid-field-name': 'some value' };
const missingId = { 'possible-options': { id: 2, value: 'aa' } };
const mixedValidInvalid = [pv1, invalidPV];

describe('@@ PossibleValuesHelper @@', () => {
  describe('replaceAll', () =>
    it('should clear data', () =>
      expect(actions.replaceAll([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateCollection', () =>
    it('should save initial data', () =>
      expect(actions.saveOrUpdateCollection(validPossibleValuesColl))
        .to.eventually.have.lengthOf(validPossibleValuesColl.length)
    )
  );

  describe('saveOrUpdateCollection', () =>
    it('should reject partially invalid collection', () =>
      expect(actions.saveOrUpdateCollection(mixedValidInvalid)).to.eventually.be.rejected
    )
  );

  describe('saveOrUpdate', () =>
    it('should successfully save valid possible values', () =>
      expect(actions.saveOrUpdate(pv2)).to.eventually.deep.equal(pv2)
    )
  );

  describe('saveOrUpdate', () =>
    it('should not be able to save invalid possible values', () =>
      expect(actions.saveOrUpdate(missingId)).to.eventually.be.rejected
    )
  );

  describe('findById', () =>
    it('should find by id', () =>
      expect(actions.findById(pv1.id)).to.eventually.deep.equal(pv1)
    )
  );

  describe('replaceAll', () =>
    it('should replace entire collection', () =>
      expect(actions.replaceAll(validPossibleValuesColl))
        .to.eventually.have.lengthOf(validPossibleValuesColl.length)
    )
  );
});
