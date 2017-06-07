import { Alert } from 'react-bootstrap';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Notification from '../../modules/helpers/NotificationHelper';

const TIMEOUT = 10 * 1000;
const CHECK_INTERVAL = 100;

class Message extends PureComponent {
  static propTypes = {
    notification: PropTypes.instanceOf(Notification).isRequired,
    onDismiss: PropTypes.func.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {
      timeLeft: TIMEOUT,
      isHovered: false
    };
  }

  componentDidMount() {
    const { onDismiss } = this.props;
    this.removalInterval = setInterval(() => {
      const { timeLeft, isHovered } = this.state;
      const newTimeLeft = timeLeft - CHECK_INTERVAL;
      if (newTimeLeft <= 0) {
        onDismiss();
      } else if (!isHovered) {
        this.setState({ timeLeft: newTimeLeft });
      }
    }, CHECK_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.removalInterval);
  }

  render() {
    const { notification, onDismiss } = this.props;
    return (
      <Alert
        onDismiss={onDismiss}
        onMouseEnter={() => this.setState({isHovered: true})}
        onMouseLeave={() => this.setState({isHovered: false})}
        onClick={() => clearTimeout(this.removalInterval)}
      >
        {notification.message}
      </Alert>
    );
  }
}

export default Message;

