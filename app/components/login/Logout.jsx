import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import translate from '../../utils/translate';
import { SYNCUP_URL } from '../../utils/Constants';
import {
  NOTIFICATION_ORIGIN_AUTHENTICATION,
  NOTIFICATION_SEVERITY_WARNING
} from '../../utils/constants/ErrorConstants';
import URLUtils from '../../utils/URLUtils';
import {
  logoutAction,
  STATE_LOGOUT_REQUESTED
} from '../../actions/LoginAction';
import Notification from '../../modules/helpers/NotificationHelper';
import FollowUp from '../notifications/followup';
import ConfirmationAlert from '../notifications/confirmationAlert';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import style from '../layout/Navbar.css';
import LoggerManager from '../../modules/util/LoggerManager';
import { startSyncUp } from '../../actions/SyncUpAction';

/* eslint-disable class-methods-use-this */

class Logout extends React.Component {

  static propTypes = {
    loggedIn: PropTypes.bool.isRequired,
    askToSync: PropTypes.bool.isRequired,
    logoutConfirmed: PropTypes.bool,
    logoutDismissedToSync: PropTypes.bool,
    onConfirmationAlert: PropTypes.func.isRequired,
    onLogoutDismissToSync: PropTypes.func.isRequired
  };

  componentDidUpdate() {
    const { logoutConfirmed, logoutDismissedToSync, onLogoutDismissToSync } = this.props;
    if (logoutConfirmed) {
      logoutAction();
    } else if (logoutDismissedToSync) {
      onLogoutDismissToSync();
    }
  }

  onLogout() {
    if (this.props.askToSync) {
      this.props.onConfirmationAlert();
    } else {
      logoutAction();
    }
  }

  render() {
    LoggerManager.log('render');
    if (this.props.loggedIn) {
      return (
        <div className={style.logout_container} >
          <Button className={style.navbar_right_side} bsStyle="link" onClick={this.onLogout.bind(this)} >
            {translate('logoff')}
          </Button >
        </div >
      );
    }
    return null;
  }
}

const logoutConfirmationAlert = () => {
  const logoutNotification = new Notification({
    message: translate('logoutConfirmation'),
    origin: NOTIFICATION_ORIGIN_AUTHENTICATION,
    severity: NOTIFICATION_SEVERITY_WARNING
  });
  const proceedWithLogout = new FollowUp({
    type: STATE_LOGOUT_REQUESTED,
    actionData: { logoutConfirmed: true }
  }, translate('logout'));
  const proceedWithSync = new FollowUp(() => startSyncUp(), translate('Sync'));
  const actions = [proceedWithLogout, proceedWithSync];
  return new ConfirmationAlert(logoutNotification, actions, true);
};

export default connect(
  state => ({
    loggedIn: state.loginReducer.loggedIn,
    askToSync: state.loginReducer.askToSync,
    logoutConfirmed: state.loginReducer.logoutConfirmed,
    logoutDismissedToSync: state.loginReducer.logoutDismissedToSync
  }),
  dispatch => ({
    onConfirmationAlert: () => dispatch(addConfirmationAlert(logoutConfirmationAlert())),
    onLogoutDismissToSync: () => {
      URLUtils.forwardTo(SYNCUP_URL);
    }
  })
)(Logout);
