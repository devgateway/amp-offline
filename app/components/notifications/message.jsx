import { Alert } from 'react-bootstrap';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Notification from '../../modules/helpers/NotificationHelper';

class Message extends PureComponent {
  static propTypes = {
    notification: PropTypes.instanceOf(Notification),
    onDismiss: PropTypes.func.isRequired
  };

  render() {
    const { notification, onDismiss } = this.props;
    return (
      <Alert onDismiss={onDismiss}>
        {notification.message}
      </Alert>
    );
  }
}

export default Message;

