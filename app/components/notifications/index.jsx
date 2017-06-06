import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import {
  dismissFullscreenAlert,
  dismissFullscreenAlertWithFollowup,
  dismissConfirmationAlert
} from '../../actions/NotificationAction';
import Notification from '../../modules/helpers/NotificationHelper';
import translate from '../../utils/translate';

class Notifications extends PureComponent {
  static propTypes = {
    fullscreenAlerts: PropTypes.arrayOf(Notification).isRequired,
    fullscreenAlertsWithFollowup: PropTypes.arrayOf(PropTypes.shape({
      notification: PropTypes.instanceOf(Notification).isRequired,
      nextAction: PropTypes.object.isRequired
    })).isRequired,
    confirmationAlerts: PropTypes.arrayOf(PropTypes.shape({
      notification: PropTypes.instanceOf(Notification).isRequired,
      yesAction: PropTypes.object,
      noAction: PropTypes.object
    })).isRequired,
    onDismissFullscreenAlert: PropTypes.func.isRequired,
    onDismissFullscreenAlertWithFollowup: PropTypes.func.isRequired,
    onDismissConfirmationAlert: PropTypes.func.isRequired,
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

    if (fullscreenAlerts[0]) {
      notification = fullscreenAlerts[0];
      onDismiss = () => onDismissFullscreenAlert(notification);
    } else if (fullscreenAlertsWithFollowup[0]) {
      notification = fullscreenAlertsWithFollowup[0].notification;
      onDismiss = () => onDismissFullscreenAlertWithFollowup(fullscreenAlertsWithFollowup[0]);
    } else return null;

    return (
      <Modal show>
        <Modal.Header>
          <Modal.Title>
            {translate('AMP Offline Message')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notification.message}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onDismiss}>
            {translate('OK')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  maybeGetConfirmationAlerts() {
    const { confirmationAlerts, onDismissConfirmationAlert } = this.props;

    if (!confirmationAlerts[0]) return null;

    const alert = confirmationAlerts[0];

    return (
      <Modal show>
        <Modal.Header>
          <Modal.Title>
            {translate('Confirmation required')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert.notification.message}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onDismissConfirmationAlert.bind(null, alert, true)}>
            {translate('Yes')}
          </Button>
          <Button onClick={onDismissConfirmationAlert.bind(null, alert, false)}>
            {translate('No')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    return (
      <div>
        {this.maybeGetFullscreenAlert() || this.maybeGetConfirmationAlerts()}
      </div>
    );
  }
}

export default connect(
  state => ({
    fullscreenAlerts: state.notificationReducer.fullscreenAlerts,
    fullscreenAlertsWithFollowup: state.notificationReducer.fullscreenAlertsWithFollowup,
    confirmationAlerts: state.notificationReducer.confirmationAlerts
  }),

  dispatch => ({
    onDismissFullscreenAlert: notification => dispatch(dismissFullscreenAlert(notification)),
    onDismissFullscreenAlertWithFollowup: alert => dispatch(dismissFullscreenAlertWithFollowup(alert)),
    onDismissConfirmationAlert: (alert, yesOrNo) => dispatch(dismissConfirmationAlert(alert, yesOrNo))
  })
)(Notifications);
