export const BUTTON_TYPE_OK = 'ok';
export const BUTTON_TYPE_CANCEL = 'cancel';

/**
 * Simple follow up action definition
 * @author Nadejda Mandrescu
 */
export default class FollowUp {
  constructor(action: Object, actionButtonTitle: string = 'Yes', buttonType: string = BUTTON_TYPE_OK) {
    this._actionButtonTitle = actionButtonTitle;
    this._action = action;
    this._buttonType = buttonType;
  }

  /**
   * @return {String} the action button title
   */
  get actionButtonTitle() {
    return this._actionButtonTitle;
  }

  get buttonType() {
    return this._buttonType;
  }

  /**
   * @return {Object} the action data to dispatch on action button
   */
  get action() {
    return this._action;
  }
}
