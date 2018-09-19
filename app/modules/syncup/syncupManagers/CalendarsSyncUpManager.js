/* eslint-disable class-methods-use-this */
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import CalendarHelper from '../../helpers/CalendarHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { CALENDAR_PULL_URL } from '../../connectivity/AmpApiConstants';
import { SYNCUP_TYPE_CALENDARS } from '../../../utils/Constants';
import Logger from '../../util/LoggerManager';

const logger = new Logger('CalendarsSyncUpManager');


/**
 * Calendars SyncUp Manager
 *
 * @author Nadejda Mandrescu
 */
export default class CalendarsSyncUpManager extends AbstractAtomicSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_CALENDARS);
  }

  doAtomicSyncUp({ saved, removed }) {
    logger.log('syncUpCalendars');
    this.diff = { saved, removed };
    return Promise.all([
      this._pullCalendar(saved).then((data) => {
        this.diff.saved = [];
        return data;
      }),
      CalendarHelper.removeAllByIds(removed).then((data) => {
        this.diff.removed = [];
        return data;
      })
    ]);
  }

  _pullCalendar(saved) {
    const paramsMap = saved.map(id => ['id', id]);
    return ConnectionHelper.doGet({ url: CALENDAR_PULL_URL, paramsMap, shouldRetry: true })
      .then(CalendarHelper.saveOrUpdateCalendarCollection);
  }
}
