import { Alert } from 'react-bootstrap';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Notification from '../../modules/helpers/NotificationHelper';
import styles from './style.css';

const TIMEOUT = 10 * 1000;//total amount of time the message stays visible
//when it's this amount of time left, we nofity the user that the message is about to disappear
const DISAPPEAR_TIMEOUT = TIMEOUT / 2;
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
      isHovered: false,
      isUnmounting: false
    };
  }

  componentDidMount() {
    const { onDismiss } = this.props;
    this.removalInterval = setInterval(() => {
      const { timeLeft, isHovered } = this.state;
      const newTimeLeft = timeLeft - CHECK_INTERVAL;
      if (newTimeLeft <= 0) {
        clearInterval(this.removalInterval);
        this.setState({ isUnmounting: true });
        setTimeout(onDismiss, 1000);
      } else if (!isHovered) {
        this.setState({ timeLeft: newTimeLeft });
      }
    }, CHECK_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.removalInterval);
  }

  getOpacity() {
    const { timeLeft, isHovered } = this.state;
    if (isHovered || (timeLeft > DISAPPEAR_TIMEOUT)){
      return 1;
    } else {
      return timeLeft / DISAPPEAR_TIMEOUT;
    }
  }

  render() {
    const { notification, onDismiss } = this.props;
    const { isUnmounting } = this.state;
    let classes = [styles.alert_wrapper];
    if (isUnmounting) classes.push(styles.unmounting);
    return (
      <div style={{opacity: this.getOpacity()}} className={classes.join(' ')}>
        <Alert
          onDismiss={onDismiss}
          onMouseEnter={() => this.setState({isHovered: true})}
          onMouseLeave={() => this.setState({isHovered: false})}
          onClick={() => clearTimeout(this.removalInterval)}
        >
          {notification.message}
        </Alert>
      </div>
    );
  }
}

export default Message;

