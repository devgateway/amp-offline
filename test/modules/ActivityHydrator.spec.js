import { describe, it } from 'mocha';
import ActivityHydrator from '../../app/modules/helpers/ActivityHydrator';
import { HIERARCHICAL_VALUE, HIERARCHICAL_VALUE_DEPTH } from '../../app/utils/constants/ActivityConstants';
import { DONOR_ORGANIZATIONS_PATH, FIELD_OPTIONS, FIELD_PATH } from '../../app/utils/constants/FieldPathConstants';

const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
// chai.use(chaiAsPromised);

const fieldsDef = [
  {
    field_name: 'donor_organization',
    field_type: 'list',
    children: [
      {
        field_name: 'organization',
        field_type: 'long'
      }
    ]
  },
  {
    /* Per Timor FM I could quickly find only "active_list" as a direct list, but this field doesn't seem to be used.
     I am adding a dummy one for testing in case such field use case will be real.
     */
    field_name: 'final_list',
    field_type: 'list'
  }
];

// due to HIERARCHICAL_VALUE, the content may vary
const org1 = Object.assign({}, { id: 1, value: 'UNDP' });
org1[HIERARCHICAL_VALUE] = null;
org1[HIERARCHICAL_VALUE_DEPTH] = 0;
const org2 = Object.assign({}, { id: 2, value: 'AfDB' });
org2[HIERARCHICAL_VALUE] = null;
org2[HIERARCHICAL_VALUE_DEPTH] = 0;
// TODO add full name unit tests once a more definite solution for extra info is available

const possibleValuesCollection = [
  {
    id: DONOR_ORGANIZATIONS_PATH,
    [FIELD_PATH]: ['donor_organization', 'organization'],
    [FIELD_OPTIONS]: { 1: org1, 2: org2 }
  },
  {
    id: 'final_list',
    [FIELD_PATH]: ['final_list'],
    [FIELD_OPTIONS]: { 1: org1, 2: org2 }
  }
];
const invalidPossibleValues = [
  {
    id: 'invalid_field',
    [FIELD_PATH]: ['invalid_field'],
    [FIELD_OPTIONS]: { 1: org1, 2: org2 }
  }
];

const activity1 = {
  donor_organization: [{ organization: 1 }, { organization: 2 }],
  final_list: [1]
};
const activity2 = {
  final_list: [1, 2]
};
const activities = [activity1, activity2];
const hydratedActivity = {
  donor_organization: [{ organization: { id: 1, value: 'UNDP' } }, { organization: { id: 2, value: 'AfDB' } }],
  final_list: [{ id: 1, value: 'UNDP' }]
};

const hydrator = new ActivityHydrator(fieldsDef);

describe('@@ ActivityHydrator @@', () => {
  describe('_hydrateEntitiesWithFullObjects',
    () => {
      // I had to take this line out from 'it' since for some reason this method was executed multiple times under 'it'
      const newActivities = hydrator._hydrateEntitiesWithFullObjects(activities, possibleValuesCollection);
      describe('multiple fields', () =>
        it('should hydrate the activity with all possible values', () => {
          expect(newActivities).to.have.length(2);
          // activity1
          expect(newActivities).to.have.deep.property('[0].donor_organization[0].organization').that.deep.equals(org1);
          expect(newActivities).to.have.deep.property('[0].donor_organization[1].organization').that.deep.equals(org2);
          expect(newActivities).to.have.deep.property('[0].final_list[0]').that.deep.equals(org1);
          // activity2
          expect(newActivities).to.have.deep.property('[1].final_list[0]').that.deep.equals(org1);
          expect(newActivities).to.have.deep.property('[1].final_list[1]').that.deep.equals(org2);
        })
      );
    }
  );

  describe('_hydrateEntitiesWithFullObjects', () =>
    it('should not fail if invalid field options are provided', () =>
      expect(hydrator._hydrateEntitiesWithFullObjects(activities, invalidPossibleValues)).to.have.length(2)
    )
  );

  describe('_hydrateEntitiesWithFullObjects',
    () => {
      const dehydratedActivity = hydrator._hydrateEntitiesWithFullObjects([hydratedActivity],
        possibleValuesCollection, false)[0];
      describe('dehyrating activity', () =>
        it('should dehydrate the activity', () => {
          expect(dehydratedActivity).to.have.deep.property('donor_organization[0].organization', 1);
          expect(dehydratedActivity).to.have.deep.property('donor_organization[1].organization', 2);
          expect(dehydratedActivity).to.have.deep.property('final_list[0]', 1);
        })
      );
    }
  );
});
