import { describe, it } from 'mocha';
import { CalendarConstants } from 'amp-ui';
import CalendarHelper from '../../app/modules/helpers/CalendarHelper';
import * as Utils from '../../app/utils/Utils';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const gregCalendar = {
  id: 54,
  [CalendarConstants.NAME]: 'Gregorian Calendar',
  [CalendarConstants.DESCRIPTION]: 'Non fiscal',
  [CalendarConstants.START_MONTH_NUMBER]: 1,
  [CalendarConstants.YEAR_OFFSET]: 0,
  [CalendarConstants.START_DAY_NUMBER]: 1,
  [CalendarConstants.BASE_CALENDAR]: CalendarConstants.BASE_CALENDAR_GREGORIAN,
  [CalendarConstants.IS_FISCAL]: false
};

const fiscalCalendar = {
  id: 4,
  [CalendarConstants.NAME]: 'Gregorian Calendar Janvier',
  [CalendarConstants.DESCRIPTION]: 'Fiscal',
  [CalendarConstants.START_MONTH_NUMBER]: 2,
  [CalendarConstants.YEAR_OFFSET]: 0,
  [CalendarConstants.START_DAY_NUMBER]: 1,
  [CalendarConstants.BASE_CALENDAR]: CalendarConstants.BASE_CALENDAR_GREGORIAN,
  [CalendarConstants.IS_FISCAL]: true
};

const calendars = [gregCalendar, fiscalCalendar];

describe('@@ CalendarHelper @@', () => {
  describe('replaceCalendars', () =>
    it('should clear data', () =>
      expect(CalendarHelper.replaceCalendars([])).to.eventually.have.lengthOf(0)
    )
  );

  describe('saveOrUpdateCalendar', () =>
    it('should save initial data', () =>
      expect(CalendarHelper.saveOrUpdateCalendar(gregCalendar).then(Utils.removeIdFromItem))
        .to.eventually.deep.equal(gregCalendar)
    )
  );

  describe('saveOrUpdateCalendarCollection', () =>
    it('should save the calendars data', () =>
      expect(CalendarHelper.saveOrUpdateCalendarCollection(calendars).then(Utils.removeIdFromCollection))
        .to.eventually.deep.have.same.members(calendars)
    )
  );

  describe('findCalendarById', () =>
    it('should find calendar by id', () =>
      expect(CalendarHelper.findCalendarById(gregCalendar.id)).to.eventually.deep.equal(gregCalendar)
    )
  );

  describe('findCalendarsByIds', () =>
    it('should find calendars by ids', () =>
      expect(CalendarHelper.findCalendarsByIds(calendars.map(c => c.id)).then(Utils.removeIdFromCollection))
        .to.eventually.deep.equal(calendars)
    )
  );

  describe('deleteCalendarById', () =>
    it('should delete calendar', () =>
      expect(CalendarHelper.deleteCalendarById(fiscalCalendar.id)).to.eventually.equal(1)
    )
  );
});
