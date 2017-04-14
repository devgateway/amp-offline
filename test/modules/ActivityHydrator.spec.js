import { describe, it } from 'mocha';
import ActivityHydrator from '../../app/modules/helpers/ActivityHydrator';

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

const org1 = { id: 1, value: 'UNDP' };
const org2 = { id: 2, value: 'AfDB' };

const possibleValuesCollection = [
  {
    id: 'donor_organization~organization',
    'field-path': ['donor_organization', 'organization'],
    'possible-options': { 1: org1, 2: org2 }
  },
  {
    id: 'final_list',
    'field-path': ['final_list'],
    'possible-options': { 1: org1, 2: org2 }
  }
];
const invalidPossibleValues = [
  {
    id: 'invalid_field',
    'field-path': ['invalid_field'],
    'possible-options': { 1: org1, 2: org2 }
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
  describe('_hydrateActivitiesWithFullObjects',
    () => {
      // I had to take this line out from 'it' since for some reason this method was executed multiple times under 'it'
      const newActivities = hydrator._hydrateActivitiesWithFullObjects(activities, possibleValuesCollection);
      describe('multiple fields', () =>
        it('should hydrate the activity with all possible values', () => {
          expect(newActivities).to.have.length(2);
          // activity1
          expect(newActivities).to.have.deep.property('[0].donor_organization[0].organization', org1);
          expect(newActivities).to.have.deep.property('[0].donor_organization[1].organization', org2);
          expect(newActivities).to.have.deep.property('[0].final_list[0]', org1);
          // activity2
          expect(newActivities).to.have.deep.property('[1].final_list[0]', org1);
          expect(newActivities).to.have.deep.property('[1].final_list[1]', org2);
        })
      );
    }
  );

  describe('_hydrateActivitiesWithFullObjects', () =>
    it('should not fail if invalid field options are provided', () =>
      expect(hydrator._hydrateActivitiesWithFullObjects(activities, invalidPossibleValues)).to.have.length(2)
    )
  );

  describe('_hydrateActivitiesWithFullObjects',
    () => {
      const dehydratedActivity = hydrator._hydrateActivitiesWithFullObjects([hydratedActivity],
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
