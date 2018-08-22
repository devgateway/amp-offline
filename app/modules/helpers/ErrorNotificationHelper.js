import Notification from '../helpers/NotificationHelper';

const ErrorNotificationHelper = {
  createNotification({ message, origin, errorCode, errorObject }) {
    return new Notification({
      message,
      origin,
      errorCode,
      errorObject
    });
  }
};

module.exports = ErrorNotificationHelper;
