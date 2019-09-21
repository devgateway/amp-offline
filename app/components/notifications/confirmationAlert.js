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
    // TODO AMPOFFLINE-1480 remove isTranslated; so far all alerts but one come translated => defaults to true
    title: string, isTranslated: boolean = true) {
    this._title = title || (isTranslated ? translate('Confirmation required') : 'Confirmation required');
    this._notification = notification;
    this._actions = actions;
    this._explicitCancel = explicitCancel;
    this._isTranslated = isTranslated;
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

  /**
   * @returns {boolean} if the alert comes with all text translated or not
   */
  get isTranslated() {
    return this._isTranslated;
  }
}
