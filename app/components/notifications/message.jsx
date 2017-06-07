import { Alert } from 'react-bootstrap';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Notification from '../../modules/helpers/NotificationHelper';

class Message extends PureComponent {
  static propTypes = {
    notification: PropTypes.instanceOf(Notification)
  };

  render() {
    const { notification } = this.props;
    return (
      <Alert>
        {notification.message}
      </Alert>
    );
  }
}

export default Message;

