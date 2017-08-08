/**
 * Simple follow up action definition
 * @author Nadejda Mandrescu
 */
export default class FollowUp {
  constructor(action: Object, actionButtonTitle: string = 'Yes') {
    this._actionButtonTitle = actionButtonTitle;
    this._action = action;
  }

  /**
   * @return {String} the action button title
   */
  get actionButtonTitle() {
    return this._actionButtonTitle;
  }

  /**
   * @return {Object} the action data to dispatch on action button
   */
  get action() {
    return this._action;
  }
}
