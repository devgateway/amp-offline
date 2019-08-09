import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ErrorConstants } from 'amp-ui';
import Notification from '../../modules/helpers/NotificationHelper';
import InfoTooltip from './InfoTooltip';
import ErrorMessage from './ErrorMessage';
import InfoMessage from './InfoMessage';
import WarnMessage from './WarnMessage';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('error message component');

/**
 * Displays a notification as a Warning, Info, Error or simple text message. It is not an alert or confirmation dialog.
 *
 * @author Nadejda Mandrescu
 */
export default class SimpleNotification extends Component {
  static propTypes = {
    notification: PropTypes.instanceOf(Notification).isRequired,
    asSimpleText: PropTypes.bool,
  };

  static defaultProps = {
    asSimpleText: false,
  };

  render() {
    const { message, details, severity } = this.props.notification;
    const infoTooltip = details ? <InfoTooltip tooltip={details} /> : null;
    const displayMessage = infoTooltip ? <span><span>{message}</span>{infoTooltip}</span> : <span>{message}</span>;
    if (this.props.asSimpleText) {
      return displayMessage;
    }
    switch (severity) {
      case ErrorConstants.NOTIFICATION_SEVERITY_ERROR:
        return <ErrorMessage message={displayMessage} />;
      case ErrorConstants.NOTIFICATION_SEVERITY_INFO:
        return <InfoMessage message={displayMessage} />;
      case ErrorConstants.NOTIFICATION_SEVERITY_WARNING:
        return <WarnMessage message={displayMessage} />;
      default:
        logger.error('Cannot display the notification: no severity configured');
        return null;
    }
  }
}
