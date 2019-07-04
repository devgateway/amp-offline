import stringifyObject from 'stringify-object';
import translate from '../../utils/translate';
import * as constants from '../../utils/constants/ErrorConstants';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Notification helper');

export default class NotificationHelper {

  /**
   * Deserialize a saved notification
   * @param json
   * @return {NotificationHelper}
   */
  static deserialize(json) {
    const n = new NotificationHelper({});
    Object.assign(n, json);
    return n;
  }

  /**
   * Tries to provide an object as a NotificationHelper or returns back the object
   * @param o
   * @return {*}
   */
  static tryAsNotification(o) {
    if (o instanceof NotificationHelper) {
      return o;
    }
    if (o instanceof Object && o._message) {
      return NotificationHelper.deserialize(o);
    }
    return o;
  }

  /**
   * Shallow clone
   * @param n the source of the notification to clone
   * @return {NotificationHelper}
   */
  static shallowClone(n: NotificationHelper) {
    return new NotificationHelper({
      // keep original message and delay the translation at display time
      message: n._message,
      prefix: n.prefix,
      details: n.details,
      origin: n.origin,
      errorCode: n.errorCode,
      translateMsg: n.translateMsg,
      translateDetails: n.translateDetails,
      replacePairs: n.replacePairs,
      severity: n.severity,
    });
  }

  /**
   * Constructor for Notifications.
   * The behavior of this object depends on the combination of parameters, if we receive a notificationHelperObject
   * it takes precedence and we construct a new helper with the same data. If not, we will usually receive a message
   * so we translate it (it can be overridden later). If we receive the origin then we can try to parse the
   * errorObject data (ie: errors from AMP API).
   * The severity defines if is information, a warning or an error (default).
   *
   * @param message
   * @param prefix (optional) message prefix
   * @param details use this to add more details that need to be used separately from original message (e.g. as tooltip)
   * @param origin
   * @param errorCode
   * @param errorObject
   * @param translateMsg translate the message or not (default true for now, since was used this since AMPOFFLINE-122)
   * @param translateDetails if to translate the details or not
   * @param replacePairs a list of [[src1, dst2], ...] pairs to replace within original message
   * @param severity
   */
  constructor({
                message, prefix, details, origin, errorCode, errorObject, translateMsg = true, translateDetails = true,
                replacePairs, severity = constants.NOTIFICATION_SEVERITY_ERROR
              }) {
    logger.log('constructor');
    this._prefix = prefix || '';
    this.translateMsg = translateMsg;
    this.translateDetails = translateDetails;
    this._replacePairs = replacePairs;
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
        this.translateMsg = false;
      } else if (message instanceof Object) {
        const fields = Object.keys(message);
        if (fields && message[fields[0]] && !isNaN(fields[0])) {
          retMessage = this.processMessageParams(message[fields[0]][0], true);
        } else {
          retMessage = stringifyObject(message, { inlineCharacterLimit: 200 });
        }
        this.translateMsg = false;
      } else {
        // In order to translate some error messages from the API we need to sanitize it first.
        if (fromAPI && message.charAt(0) === '(' && message.charAt(message.length - 1) === ')') {
          message = message.substring(1, message.length - 1);
        }
        retMessage = message;
      }
    } catch (err) {
      logger.warn(err);
      retMessage = stringifyObject(message());
      this.translateMsg = false;
    }
    return retMessage;
  }

  toString() {
    return this._message;
  }

  get message() {
    let msg = this._message && this.translateMsg ? translate(this._message) : this._message;
    if (this._replacePairs) {
      this._replacePairs.forEach(([src, dst]) => {
        // replace all pairs occurrences
        msg = msg.split(src).join(dst);
      });
    }
    return `${this._prefix}${msg}`;
  }

  get prefix() {
    return this._prefix;
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

  set prefix(prefix) {
    this._prefix = prefix;
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

  set replacePairs(replacePairs) {
    this._replacePairs = replacePairs;
  }

  get replacePairs() {
    return this._replacePairs;
  }

  /**
   * Shallow clone
   * @return {NotificationHelper}
   */
  shallowClone() {
    return NotificationHelper.shallowClone(this);
  }
}
