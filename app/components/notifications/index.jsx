import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import {
  dismissFullscreenAlert
} from '../../actions/NotificationAction';
import Notification from '../../modules/helpers/NotificationHelper';
import translate from '../../utils/translate';

class Notifications extends PureComponent {
  static propTypes = {
    fullscreenAlerts: PropTypes.arrayOf(Notification).isRequired,
    fullscreenAlertsWithFollowup: PropTypes.arrayOf(PropTypes.shape({
      notification: PropTypes.instanceOf(Notification).isRequired,
      callback: PropTypes.func.isRequired
    })).isRequired,
    onDismissFullscreenAlert: PropTypes.func.isRequired
  };

  maybeGetFullscreenAlert() {
    const { fullscreenAlerts, fullscreenAlertsWithFollowup, onDismissFullscreenAlert } = this.props;
    let notification;
    let onDismiss;
    if (fullscreenAlerts[0]) {
      notification = fullscreenAlerts[0];
      onDismiss = () => onDismissFullscreenAlert(notification);
    } else if (fullscreenAlertsWithFollowup[0]) {
      notification = fullscreenAlertsWithFollowup[0].notification;
      onDismiss = () => null;
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

  render() {
    return (
      <div>
        {this.maybeGetFullscreenAlert()}
      </div>
    );
  }
}

export default connect(
  state => ({
    fullscreenAlerts: state.notificationReducer.fullscreenAlerts,
    fullscreenAlertsWithFollowup: state.notificationReducer.fullscreenAlertsWithFollowup
  }),

  dispatch => ({
    onDismissFullscreenAlert: notification => dispatch(dismissFullscreenAlert(notification)),
  })
)(Notifications);
