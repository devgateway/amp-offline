import Notification from '../helpers/NotificationHelper';

const ErrorNotificationHelper = {
  createNotification({ message, origin, errorObject }) {
    return new Notification({
      message,
      origin,
      errorObject
    });
  }
};

module.exports = ErrorNotificationHelper;
