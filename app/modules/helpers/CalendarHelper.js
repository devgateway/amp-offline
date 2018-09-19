import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_CALENDARS } from '../../utils/Constants';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('CalendarHelper');

/**
 * A simplified helper for using calendars storage for loading, searching / filtering, saving and deleting calendars.
 *
 * @author Nadejda Mandrescu
 */
const CalendarHelper = {

  findCalendarById(id) {
    logger.debug('findCalendarById');
    const filterRule = { id };
    return CalendarHelper.findCalendar(filterRule);
  },

  findCalendarsByIds(ids) {
    logger.debug('findCalendarsByIds');
    const filterRule = { id: { $in: ids } };
    return CalendarHelper.findAllCalendars(filterRule);
  },

  findCalendar(filterRule) {
    logger.debug('findCalendar');
    return DatabaseManager.findOne(filterRule, COLLECTION_CALENDARS);
  },

  findAllCalendars(filterRule, projections) {
    logger.debug('findAllCalendars');
    return DatabaseManager.findAll(filterRule, COLLECTION_CALENDARS, projections);
  },

  /**
   * Save the calendar
   * @param calendar
   * @returns {Promise}
   */
  saveOrUpdateCalendar(calendar) {
    logger.log('saveOrUpdateCalendar');
    return DatabaseManager.saveOrUpdate(calendar.id, calendar, COLLECTION_CALENDARS);
  },

  saveOrUpdateCalendarCollection(calendars) {
    logger.log('saveOrUpdateCalendarCollection');
    return DatabaseManager.saveOrUpdateCollection(calendars, COLLECTION_CALENDARS);
  },

  replaceCalendars(calendars) {
    logger.log('replaceCalendars');
    return DatabaseManager.replaceCollection(calendars, COLLECTION_CALENDARS);
  },

  /**
   * Remove the calendar by id
   * @param id
   * @returns {Promise}
   */
  deleteCalendarById(id) {
    logger.log('deleteCalendarById');
    return DatabaseManager.removeById(id, COLLECTION_CALENDARS);
  },

  removeAllByIds(ids) {
    logger.log('removeAllByIds');
    const idsFilter = { id: { $in: ids } };
    return DatabaseManager.removeAll(idsFilter, COLLECTION_CALENDARS);
  }
};

export default CalendarHelper;
