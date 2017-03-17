import { describe, it } from 'mocha';
import * as actions from '../../app/modules/helpers/ActivityHelper';
import * as AC from '../../app/utils/constants/ActivityConstants';
import * as Utils from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const title1 = 'New Local Activity';
const newOfflineActivity = Utils.toMap(AC.PROJECT_TITLE, 'New Local Activity');
const title2 = 'Updated Activity';
const updatedOfflineActivity = Object.assign({ id: '100' },
  Utils.toMap(AC.AMP_ID, 'amp1'),
  Utils.toMap(AC.INTERNAL_ID, '123'),
  Utils.toMap(AC.PROJECT_TITLE, title2));
// TODO update with AMPOFFLINE-121
const rejectedActivity1 = Object.assign({}, updatedOfflineActivity,
  { id: Utils.stringToUniqueId(title2) }, Utils.toMap(AC.REJECTED_ID, 1));
const rejectedActivity2 = Object.assign({}, updatedOfflineActivity,
  { id: Utils.stringToUniqueId(title2) }, Utils.toMap(AC.REJECTED_ID, 2));
const activities = [newOfflineActivity, updatedOfflineActivity, rejectedActivity1, rejectedActivity2];

describe('@@ ActivityHelper @@', () => {
  describe('replaceAll', () =>
    it('should clear all existing activities', () =>
      expect(actions.replaceAll([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('findAll', () =>
    it('should not find any activity', () =>
      expect(actions.findAll({})).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdate', () =>
    it('should save initial activity', () =>
      expect(actions.saveOrUpdate(newOfflineActivity)).to.eventually.deep.equal(newOfflineActivity)
    )
  );

  describe('saveOrUpdateCollection', () =>
    it('should update the existing and insert new', () =>
      expect(actions.saveOrUpdateCollection(activities)).to.eventually.have.lengthOf(activities.length)
    )
  );

  describe('replaceAll', () =>
    it('should replace all existing with new', () =>
      expect(actions.replaceAll(activities)).to.eventually.have.lengthOf(activities.length)
    )
  );

  describe('findNonRejectedById', () =>
    it('should find non rejected activity with id "100"', () =>
      expect(actions.findNonRejectedById('100')).to.eventually.have.property(AC.PROJECT_TITLE, title2)
    )
  );

  describe('findNonRejectedByInternalId', () =>
    it('should find non rejected activity with internalId "123"', () =>
      expect(actions.findNonRejectedByInternalId('123')).to.eventually.have.property(AC.PROJECT_TITLE, title2)
    )
  );

  describe('findNonRejectedByAmpId', () =>
    it('should find non rejected activity with amp_id "amp1"', () =>
      expect(actions.findNonRejectedByAmpId('amp1')).to.eventually.have.property(AC.PROJECT_TITLE, title2)
    )
  );

  describe('findNonRejectedByProjectTitle', () =>
    it(`should find non rejected activity named ${title2}`, () =>
      expect(actions.findNonRejectedByProjectTitle(title2)).to.eventually.deep.equal(updatedOfflineActivity)
    )
  );

  describe('findAllNonRejected', () =>
    it(`should a filtered collection with only activity named ${title1}`, () =>
      expect(actions.findAllNonRejected({ id: { $ne: '100' } }, Utils.toMap(AC.PROJECT_TITLE, 1)))
        .to.eventually.deep.equal([Utils.toMap(AC.PROJECT_TITLE, title1)])
    )
  );

  describe('findAllRejected', () =>
    it('should find 2 rejected activity with amp_id "amp1"', () =>
      expect(actions.findAllRejected(Utils.toMap(AC.AMP_ID, 'amp1'))).to.eventually.have.lengthOf(2)
    )
  );

  describe('findAllRejected', () =>
    it('should find 2 rejected activities', () =>
      expect(actions.findAllRejected({})).to.eventually.have.lengthOf(2)
    )
  );

  describe('findAllRejected', () =>
    it('should find one rejected activity with rejectedId=2', () =>
      expect(actions.findAllRejected(Utils.toMap(AC.REJECTED_ID, 2))).to.eventually.deep.equal([rejectedActivity2])
    )
  );

  describe('removeNonRejectedById', () =>
    it('should not be able to remove as a non rejected activity, an activity that is in rejected state', () =>
      expect(actions.removeNonRejectedById(rejectedActivity2.id)).to.eventually.equal(null)
    )
  );

  describe('removeNonRejectedById', () =>
    it('should remove a non rejected activity', () =>
      expect(actions.removeNonRejectedById(newOfflineActivity.id)).to.eventually.equal(1)
    )
  );

  describe('removeNonRejectedByAmpId', () =>
    it('should not be able to remove any rejected activity when calling removal for non rejected activity', () =>
      expect(actions.removeNonRejectedById(updatedOfflineActivity[AC.AMP_ID])).to.eventually.equal(null)
    )
  );

  describe('removeRejected', () =>
    it('should be able to remove a rejected activity', () =>
      expect(actions.removeRejected(rejectedActivity2.id)).to.eventually.equal(1)
    )
  );

  describe('removeAll', () =>
    it('should be able to remove all activities', () =>
      expect(actions.replaceAll(activities).then(actions.removeAll({}))).to.eventually.have.lengthOf(activities.length)
    )
  );
});
