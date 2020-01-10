/* eslint-disable jsx-a11y/href-no-hash */
/* eslint-disable class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Constants, ErrorConstants } from 'amp-ui';
import translate from '../../utils/translate';
import URLUtils from '../../utils/URLUtils';
import { logoutAction, STATE_LOGOUT_REQUESTED } from '../../actions/LoginAction';
import Notification from '../../modules/helpers/NotificationHelper';
import FollowUp from '../notifications/followup';
import ConfirmationAlert from '../notifications/confirmationAlert';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import style from '../layout/Navbar.css';
import Logger from '../../modules/util/LoggerManager';
import { startSyncUp } from '../../actions/SyncUpAction';

const logger = new Logger('Logout');

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
    logger.log('render');
    if (this.props.loggedIn) {
      // DO NOT add href since it can cause AMPOFFLINE-878
      return (
        <a
          className={[style.navbar_right_side, style.logout_link].join(' ')}
          onClick={this.onLogout.bind(this)}>{translate('logout')}
        </a>
      );
    }
    return null;
  }
}

const logoutConfirmationAlert = () => {
  const logoutNotification = new Notification({
    message: translate('logoutConfirmation'),
    origin: ErrorConstants.NOTIFICATION_ORIGIN_AUTHENTICATION,
    severity: ErrorConstants.NOTIFICATION_SEVERITY_WARNING
  });
  const proceedWithLogout = new FollowUp({
    type: STATE_LOGOUT_REQUESTED,
    actionData: { logoutConfirmed: true }
  }, translate('logout'));
  const proceedWithSync = new FollowUp(() => startSyncUp(), translate('Synchronize'));
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
      URLUtils.forwardTo(Constants.SYNCUP_REDIRECT_URL);
    }
  })
)(Logout);
