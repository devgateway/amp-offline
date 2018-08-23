import stringifyObject from 'stringify-object';
import translate from '../../utils/translate';
import * as constants from '../../utils/constants/ErrorConstants';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Notification helper');

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
   * @param details use this to add more details that need to be used separately from original message (e.g. as tooltip)
   * @param origin
   * @param errorCode
   * @param errorObject
   * @param translateMsg translate the message or not (default true for now, since was used this since AMPOFFLINE-122)
   * @param translateDetails if to translate the details or not
   * @param severity
   */
  constructor({
                message, details, origin, errorCode, errorObject, translateMsg = true, translateDetails = true,
                severity = constants.NOTIFICATION_SEVERITY_ERROR
              }) {
    logger.log('constructor');
    this.translateMsg = translateMsg;
    this.translateDetails = translateDetails;
    if (errorObject) {
      this.message = errorObject.message;
      this.details = errorObject.details;
      this.internalCode = errorObject.internalCode;
      this.origin = errorObject.origin;
      this.severity = errorObject.severity;
      this.errorCode = errorObject.errorCode || errorCode;
    } else {
      this.errorCode = errorCode;
      if (message) {
        this.message = this.processMessageParams(message);
      }
      this.details = details;
      this.severity = severity;
      if (origin) {
        this.origin = origin;
      }
    }
    // TODO: If we save the stacktrace here we can have the full info about the error's origin.
    logger.error(`${this.message} - ${this.internalCode} - ${this.origin}`);
  }

  processMessageParams(message, fromAPI) {
    /* We need to be sure the message param (it can be a String, Object, Array inside an Object, etc
     * is shown correctly to the user. */
    let retMessage = null;
    try {
      if (message instanceof Error) {
        retMessage = message.message;
        logger.error(message.stack);
      } else if (message instanceof Object) {
        const fields = Object.keys(message);
        if (fields && message[fields[0]] && !isNaN(fields[0])) {
          retMessage = this.processMessageParams(message[fields[0]][0], true);
        } else {
          retMessage = stringifyObject(message, { inlineCharacterLimit: 200 });
        }
      } else {
        // In order to translate some error messages from the API we need to sanitize it first.
        if (fromAPI && message.charAt(0) === '(' && message.charAt(message.length - 1) === ')') {
          message = message.substring(1, message.length - 1);
        }
        retMessage = this.translateMsg ? translate(message) : message;
      }
    } catch (err) {
      logger.warn(err);
      retMessage = stringifyObject(message());
    }
    return retMessage;
  }

  toString() {
    return this._message;
  }

  get message() {
    return this._message;
  }

  get details() {
    return this._details && this.translateDetails ? translate(this._details) : this._details;
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

  set details(details) {
    this._details = details;
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

  set errorCode(errorCode) {
    this._errorCode = errorCode;
  }

  get errorCode() {
    return this._errorCode;
  }
}
