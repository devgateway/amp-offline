import { describe, it } from 'mocha';
import { FieldPathConstants } from 'amp-ui';
import actions from '../../app/modules/helpers/PossibleValuesHelper';
import Logger from '../../app/modules/util/LoggerManager';
import * as Utils from '../../app/utils/Utils';

const logger = new Logger('Possible values helper');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

let ampFormatPV1 = {
  [FieldPathConstants.DONOR_ORGANIZATIONS_PATH]: [
    {
      id: 1,
      value: 'African Capacity Building Foundation'
    },
    {
      id: 2,
      value: 'Agence Canadienne pour le Développement International'
    }
  ]
};
let ampFormatPV2 = {
  'executing_agency~organization': [
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
let ampFormatPVwithTranslations = {
  'beneficiary_agency~organization': [
    {
      id: 3,
      value: 'Agence Française de Développement',
      'translated-value': {
        en: 'Agence Française de Développement'
      }
    },
    {
      id: 4,
      value: 'Agence internationale de l\'Energie Atomique',
      'translated-value': {
        en: 'Agence internationale de l\'Energie Atomique'
      }
    }
  ]
};

let ampFormatContact = {
  'contact~organisation_contacts~organisation': [
    {
      id: 3,
      value: 'Agence Française de Développement',
      'translated-value': {
        en: 'Agence Française de Développement'
      }
    },
    {
      id: 4,
      value: 'Agence internationale de l\'Energie Atomique',
      'translated-value': {
        en: 'Agence internationale de l\'Energie Atomique'
      }
    }
  ]
};

let treeOptions = {
  'national_plan_objective~program': [
    {
      id: 26,
      value: 'Programmes Sectoriels',
      children: [
        {
          id: 27,
          value: "PDDE - Programme décennal de développement de l'éducation - 2003",
          'translated-value': {
            fr: "PDDE - Programme décennal de développement de l'éducation - 2003"
          }
        }
      ]
    }
  ]
};

let validPossibleValuesColl = [/* ampFormatPV1, ampFormatPV2, ampFormatPVwithTranslations */];
let invalidPV = { 'invalid-field-name': 'some value' };
let missingId = { [FieldPathConstants.FIELD_OPTIONS]: [{ value: 'aa' }, { id: 2, value: 'bb' }] };
let mixedValidInvalid = [/* ampFormatPV1, invalidPV */];

const validContactsOptions = [
  {
    id: 'organisation_contacts~organisation',
    [FieldPathConstants.FIELD_PATH]: ['organisation_contacts', 'organisation'],
    [FieldPathConstants.FIELD_OPTIONS]: {
      3: {
        id: 3,
        parentId: undefined,
        value: 'Agence Française de Développement',
        'translated-value': {
          en: 'Agence Française de Développement'
        }
      },
      4: {
        id: 4,
        parentId: undefined,
        value: 'Agence internationale de l\'Energie Atomique',
        'translated-value': {
          en: 'Agence internationale de l\'Energie Atomique'
        }
      }
    }
  }
];

describe('@@ PossibleValuesHelper @@', () => {
  describe('replaceAll', () =>
    it('should clear data', () =>
      expect(actions.replaceAll([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('transformToClientUsage', () =>
    it('should successfully transform data', () =>
      expect(() => {
        ampFormatPV1 = actions.transformToClientUsage(Object.entries(ampFormatPV1)[0]);
        ampFormatPV2 = actions.transformToClientUsage(Object.entries(ampFormatPV2)[0]);
        ampFormatPVwithTranslations = actions.transformToClientUsage(Object.entries(ampFormatPVwithTranslations)[0]);
        ampFormatContact = actions.transformToClientUsage(Object.entries(ampFormatContact)[0]);
        treeOptions = actions.transformToClientUsage((Object.entries(treeOptions)[0]));
        validPossibleValuesColl = [ampFormatPV1, ampFormatPV2, ampFormatPVwithTranslations, ampFormatContact];

        invalidPV = actions.transformToClientUsage(Object.entries(invalidPV)[0]);
        missingId = actions.transformToClientUsage(Object.entries(missingId)[0]);
        mixedValidInvalid = [invalidPV, missingId];
        logger.log(JSON.stringify(treeOptions));
      }).to.not.throw(Error)
    )
  );

  describe('saveOrUpdateCollection', () =>
    it('should save initial data', () =>
      expect(actions.saveOrUpdateCollection(validPossibleValuesColl))
        .to.eventually.have.lengthOf(validPossibleValuesColl.length)
    )
  );

  describe('findAllByIdsWithoutPrefixAndCleanupPrefix', () =>
    it('should find valid contact options in processed format', () =>
      expect(actions.findAllByIdsWithoutPrefixAndCleanupPrefix(FieldPathConstants.PREFIX_CONTACT)
        .then(Utils.removeIdFromCollection)
      ).to.eventually.deep.equal(validContactsOptions)
    )
  );

  describe('saveOrUpdateCollection', () =>
    it('should reject partially invalid collection', () =>
      expect(actions.saveOrUpdateCollection(mixedValidInvalid)).to.eventually.be.rejected
    )
  );

  describe('saveOrUpdate', () =>
    it('should successfully save valid possible values', () =>
      expect(actions.saveOrUpdate(ampFormatPV2).then(dbData => {
        delete dbData._id;
        return dbData;
      })).to.eventually.deep.equal(ampFormatPV2)
    )
  );

  describe('saveOrUpdate', () =>
    it('should successfully save valid possible values with children', () =>
      expect(actions.saveOrUpdate(treeOptions).then(dbData => {
        delete dbData._id;
        return dbData;
      })).to.eventually.deep.equal(treeOptions)
    )
  );

  describe('saveOrUpdate', () =>
    it('should not be able to save invalid possible values', () =>
      expect(actions.saveOrUpdate(missingId)).to.eventually.be.rejected
    )
  );

  describe('findById', () =>
    it('should find by id', () =>
      expect(actions.findById(ampFormatPV1.id)).to.eventually.deep.equal(ampFormatPV1)
    )
  );

  describe('replaceAll', () =>
    it('should replace entire collection', () =>
      expect(actions.replaceAll(validPossibleValuesColl))
        .to.eventually.have.lengthOf(validPossibleValuesColl.length)
    )
  );
});
