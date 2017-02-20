import translate from '../../utils/translate';
import * as constants from '../../utils/constants/ErrorConstants';

export default class NotificationHelper {

  /**
   * Constructor for Notifications.
   * The behavior of this object depends on the combination of parameters, if we receive a notificationHelperObject
   * it takes precedence and we construct a new helper with the same data. If not, we will usually receive a message
   * so we translate it (it can be overridden later). If we receive the origin then we can try to parse the
   * errorObject data (ie: errors from AMP API).
   * The severity defines if is information, a warning or an error (default).
   *
   * @param message
   * @param origin
   * @param notificationHelperObject
   * @param errorObject
   * @param severity
   */
  constructor({
    message, origin, notificationHelperObject, errorObject,
    severity = constants.NOTIFICATION_SEVERITY_ERROR
  }) {
    console.log('constructor');
    if (notificationHelperObject) {
      this.message = notificationHelperObject.message;
      this.internalCode = notificationHelperObject.internalCode;
      this.origin = notificationHelperObject.origin;
      this.severity = notificationHelperObject.severity;
    } else {
      if (message) {
        this.message = translate(message);
      }
      this.severity = severity;
      if (origin) {
        this.origin = origin;
        // Do some special processing here depending of the origin reported.
        switch (this.origin) {
          case constants.NOTIFICATION_ORIGIN_API_NETWORK:
          case constants.NOTIFICATION_ORIGIN_API_SECURITY:
          case constants.NOTIFICATION_ORIGIN_API_GENERAL:
            if (errorObject) {
              const fields = Object.keys(errorObject);
              if (fields && errorObject[fields[0]] && !isNaN(fields[0])) {
                this.internalCode = parseInt(fields[0], 10);
                this.message = translate(errorObject[fields[0]][0]);
              } else {
                this.message = errorObject.toString();
              }
            }
            break;
          default:
            break;
        }
      }
    }
    // TODO: If we save the stacktrace here we can have the full info about the error's origin.
    console.error(`${this.message} - ${this.internalCode} - ${this.origin}`);
  }

  toString() {
    return this._message;
  }

  get message() {
    return this._message;
  }

  get internalCode() {
    return this._internalCode;
  }

  get origin() {
    return this._origin;
  }

  get severity() {
    return this._severity;
  }

  set message(message) {
    this._message = message;
  }

  set internalCode(internalCode) {
    this._internalCode = internalCode;
  }

  set origin(origin) {
    this._origin = origin;
  }

  set severity(severity) {
    this._severity = severity;
  }
}
