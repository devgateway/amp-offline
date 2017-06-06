import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { PropTypes } from 'prop-types';
import { dismissFullscreenAlert } from '../../actions/NotificationAction';
import Notification from '../../modules/helpers/NotificationHelper';
import translate from '../../utils/translate';

class Notifications extends PureComponent {
  static propTypes = {
    fullscreenAlerts: PropTypes.arrayOf(Notification).isRequired,
    onDismissFullscreenAlert: PropTypes.function.isRequired
  };

  render() {
    const { fullscreenAlerts, onDismissFullscreenAlert } = this.props;
    if (fullscreenAlerts[0]) {
      const alert = fullscreenAlerts[0];
      return (
        <Modal show>
          <Modal.Header>
            <Modal.Title>
              {translate('AMP Offline Message')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {alert.message}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => onDismissFullscreenAlert(alert)}>
              {translate('OK')}
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
    return null;
  }
}

export default connect(
  state => ({
    fullscreenAlerts: state.notificationReducer.fullscreenAlerts
  }),

  dispatch => ({
    onDismissFullscreenAlert: notification => dispatch(dismissFullscreenAlert(notification))
  })
)(Notifications);
