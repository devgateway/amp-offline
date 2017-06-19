import { Alert } from 'react-bootstrap';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Notification from '../../modules/helpers/NotificationHelper';
import styles from './style.css';
import {
  NOTIFICATION_SEVERITY_WARNING,
  NOTIFICATION_SEVERITY_INFO,
  NOTIFICATION_SEVERITY_ERROR
} from '../../utils/constants/ErrorConstants';

import {
  MESSAGE_TIMEOUT,
  MESSAGE_DISAPPEAR_TIMEOUT,
  MESSAGE_CHECK_INTERVAL,
  MESSAGE_ANIMATION_DURATION
} from '../../utils/Constants';

class Message extends PureComponent {
  static propTypes = {
    notification: PropTypes.instanceOf(Notification).isRequired,
    onDismiss: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {
      timeLeft: MESSAGE_TIMEOUT,
      isHovered: false,
      isMounting: false,
      isUnmounting: false,
      wasDismissedByUser: false,
      wasStoppedByUser: false
    };
  }

  componentDidMount() {
    this.removalInterval = setInterval(() => {
      const { timeLeft, isHovered } = this.state;
      const newTimeLeft = timeLeft - MESSAGE_CHECK_INTERVAL;
      if (newTimeLeft <= 0) {
        this.dismiss();
      } else if (!isHovered) {
        this.setState({ timeLeft: newTimeLeft });
      }
    }, MESSAGE_CHECK_INTERVAL);

    setTimeout(() => this.setState({ isMounting: true }));
  }

  componentWillUnmount() {
    clearInterval(this.removalInterval);
  }

  getBsStyle() {
    const { notification } = this.props;
    switch (notification.severity) {
      case NOTIFICATION_SEVERITY_ERROR: return 'danger';
      case NOTIFICATION_SEVERITY_WARNING: return 'warning';
      case NOTIFICATION_SEVERITY_INFO: return 'info';
      default: return 'success';
    }
  }

  getOpacity() {
    const { timeLeft, isHovered, wasStoppedByUser } = this.state;
    if (isHovered || wasStoppedByUser || (timeLeft > MESSAGE_DISAPPEAR_TIMEOUT)) {
      return 1;
    } else {
      return timeLeft / MESSAGE_DISAPPEAR_TIMEOUT;
    }
  }

  dismiss() {
    const { onDismiss } = this.props;
    clearInterval(this.removalInterval);
    this.setState({ isUnmounting: true });
    setTimeout(onDismiss, MESSAGE_ANIMATION_DURATION);
  }

  handleUserDismissal() {
    this.setState({ wasDismissedByUser: true });
    setTimeout(() => this.dismiss(), MESSAGE_ANIMATION_DURATION);
  }

  stoppedByUser() {
    clearInterval(this.removalInterval);
    this.setState({ wasStoppedByUser: true });
  }

  render() {
    const { notification } = this.props;
    const { isMounting, isUnmounting, wasDismissedByUser } = this.state;

    const classes = [styles.alert_wrapper];
    if (isMounting) classes.push(styles.mounted);
    if (isUnmounting) classes.push(styles.unmounting);
    if (wasDismissedByUser) classes.push(styles.user_dismissed);
    return (
      <div style={{ opacity: this.getOpacity() }} className={classes.join(' ')}>
        <Alert
          onDismiss={() => this.handleUserDismissal()}
          onMouseEnter={() => this.setState({ isHovered: true })}
          onMouseLeave={() => this.setState({ isHovered: false })}
          onClick={() => this.stoppedByUser()}
          bsStyle={this.getBsStyle()}
        >
          {notification.message}
        </Alert>
      </div>
    );
  }
}

export default Message;

