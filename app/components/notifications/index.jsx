/*
 Related action creators and more info: actions/NotificationAction
 Related reducer: reducers/NotificationReducer
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import {
  dismissFullscreenAlert,
  dismissFullscreenAlertWithFollowup,
  dismissConfirmationAlert,
  dismissMessage
} from '../../actions/NotificationAction';
import Notification from '../../modules/helpers/NotificationHelper';
import translate from '../../utils/translate';
import styles from './style.css';
import Message from './message';
import FollowUp from './followup';
import ConfirmationAlert from './confirmationAlert';

class Notifications extends PureComponent {
  static propTypes = {
    fullscreenAlerts: PropTypes.arrayOf(PropTypes.instanceOf(Notification)).isRequired,
    fullscreenAlertsWithFollowup: PropTypes.arrayOf(PropTypes.shape({
      notification: PropTypes.instanceOf(Notification).isRequired,
      nextAction: PropTypes.object.isRequired
    })).isRequired,
    confirmationAlerts: PropTypes.arrayOf(ConfirmationAlert).isRequired,
    messages: PropTypes.arrayOf(PropTypes.instanceOf(Notification)).isRequired,
    onDismissFullscreenAlert: PropTypes.func.isRequired,
    onDismissFullscreenAlertWithFollowup: PropTypes.func.isRequired,
    onDismissConfirmationAlert: PropTypes.func.isRequired,
    onDismissMessage: PropTypes.func.isRequired,
  };

  maybeGetFullscreenAlert() {
    const {
      fullscreenAlerts,
      fullscreenAlertsWithFollowup,
      onDismissFullscreenAlert,
      onDismissFullscreenAlertWithFollowup
    } = this.props;

    let notification;
    let onDismiss;
    let title;
    let buttonLabel;

    if (fullscreenAlerts[0]) {
      notification = fullscreenAlerts[0];
      onDismiss = () => onDismissFullscreenAlert(notification);
      title = translate('AMP Offline Message');
      buttonLabel = translate('OK');
    } else if (fullscreenAlertsWithFollowup[0]) {
      notification = fullscreenAlertsWithFollowup[0].notification;
      onDismiss = () => onDismissFullscreenAlertWithFollowup(fullscreenAlertsWithFollowup[0]);
      title = translate('Confirmation required');
      buttonLabel = translate('Proceed');
    } else return null;

    return (
      <Modal show>
        <Modal.Header>
          <Modal.Title>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notification.message}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onDismiss}>
            {buttonLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  maybeGetConfirmationAlerts() {
    const { confirmationAlerts, onDismissConfirmationAlert } = this.props;

    if (!confirmationAlerts[0]) return null;

    const alert: ConfirmationAlert = confirmationAlerts[0];

    return (
      <Modal show>
        <Modal.Header>
          <Modal.Title>
            {alert.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert.notification.message}
        </Modal.Body>
        <Modal.Footer>
          {alert.actions.map((followUp: FollowUp) => (
            <Button
              key={followUp.actionButtonTitle} onClick={onDismissConfirmationAlert.bind(null, alert, followUp.action)} >
              {followUp.actionButtonTitle}
            </Button>
            )
          )}
          {alert.explicitCancel && (
            <Button onClick={onDismissConfirmationAlert.bind(null, alert, null)} >
              {translate('Cancel')}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }

  maybeGetMessages() {
    const { messages, onDismissMessage } = this.props;

    if (!messages.length) return null;

    return (
      <div className={styles.message_container}>
        {messages.map(notification =>
          <Message
            key={notification.message}
            notification={notification}
            onDismiss={onDismissMessage.bind(null, notification)}
          />
        )}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.maybeGetFullscreenAlert() || this.maybeGetConfirmationAlerts()}
        {this.maybeGetMessages()}
      </div>
    );
  }
}

export default connect(
  state => ({
    fullscreenAlerts: state.notificationReducer.fullscreenAlerts,
    fullscreenAlertsWithFollowup: state.notificationReducer.fullscreenAlertsWithFollowup,
    confirmationAlerts: state.notificationReducer.confirmationAlerts,
    messages: state.notificationReducer.messages
  }),

  dispatch => ({
    onDismissFullscreenAlert: notification => dispatch(dismissFullscreenAlert(notification)),
    onDismissFullscreenAlertWithFollowup: alert => dispatch(dismissFullscreenAlertWithFollowup(alert)),
    onDismissConfirmationAlert: (alert, followUp) => dispatch(dismissConfirmationAlert(alert, followUp)),
    onDismissMessage: notification => dispatch(dismissMessage(notification))
  })
)(Notifications);
