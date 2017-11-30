import FollowUp from './followup';
import Notification from '../../modules/helpers/NotificationHelper';
import translate from '../../utils/translate';

/**
 * A simple confirmation alert definition. This will not force any action if explicit cancel or any other "no action"
 * action is choosen by the user.
 *
 * @author Nadejda Mandrescu
 */
export default class ConfirmationAlert {
  constructor(notification: Notification, actions: Array<FollowUp>, explicitCancel: boolean = true,
    title: string = translate('Action required')) {
    this._notification = notification;
    this._title = title;
    this._actions = actions;
    this._explicitCancel = explicitCancel;
  }

  /**
   * @return {NotificationHelper} is expected to be an instance of ../modules/helpers/NotificationHelper
   */
  get notification() {
    return this._notification;
  }

  /**
   * @return {string} the alert title
   */
  get title() {
    return this._title;
  }

  /**
   * @return {Array.<FollowUp>} the list of follow up actions
   */
  get actions() {
    return this._actions;
  }

  /**
   * @return {boolean} if explicit cancel button must be displayed or not
   */
  get explicitCancel() {
    return this._explicitCancel;
  }
}
