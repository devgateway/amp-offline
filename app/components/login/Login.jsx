import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from './Login.css';
import ErrorMessage from '../common/ErrorMessage';
import Span from '../i18n/Span';
import Button from '../i18n/Button';
import LoggerManager from '../../modules/util/LoggerManager';
import { MANDATORY_UPDATE } from '../../actions/ConnectivityAction';
import FollowUp from '../../components/notifications/followup';
import ConfirmationAlert from '../../components/notifications/confirmationAlert';
import Notification from '../../modules/helpers/NotificationHelper';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import {
  NOTIFICATION_ORIGIN_UPDATE_CHECK, NOTIFICATION_SEVERITY_WARNING
} from '../../utils/constants/ErrorConstants';
import translate from '../../utils/translate';
import { STATE_DOWNLOAD_UPDATE_CONFIRMED } from './../../actions/StartUpAction';

class Login extends Component {

  // This seems to be a way to validate this component receives some props.
  static propTypes = {
    // This React component receives the login function to be dispatched as a prop,
    // so it doesnt have to know about the implementation.
    loginAction: PropTypes.func.isRequired,
    loginReducer: PropTypes.object.isRequired,
    forceUpdateToContinue: PropTypes.bool,
    suggestUpdateToContinue: PropTypes.bool,
    onConfirmationAlert: PropTypes.func.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');

    this.state = {
      email: 'testuser@amp.org',
      password: 'password'
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  processLogin(email, password) {
    if (this.props.forceUpdateToContinue) {
      // Login not allowed.
      this.props.onConfirmationAlert(true);
    } else {
      if (this.props.suggestUpdateToContinue) {
        // Login allowed + suggested update alert.
        this.props.onConfirmationAlert(false);
      }
      this.props.loginAction(email, password);
    }
  }

  render() {
    LoggerManager.log('render');
    return (
      <div className={styles.centered_form}>
        <table>
          <tbody>
            <tr>
              <td><Span text="user" /></td>
              <td>
                <input
                  type="text" value={this.state.email} onChange={this.handleEmailChange}
                  className="form-control" />
              </td>
            </tr>
            <tr>
              <td><Span text="password" /></td>
              <td>
                <input
                  type="password" value={this.state.password} onChange={this.handlePasswordChange}
                  className="form-control" />
              </td>
            </tr>
          </tbody>
        </table>
        <Button
          type="button" className={`btn btn-success ${(this.props.loginReducer.loginProcessing ? 'disabled' : '')}`}
          onClick={() => {
            this.processLogin(this.state.email.toLowerCase(), this.state.password);
          }} text="login" />
        <hr />
        <ErrorMessage message={this.props.loginReducer.errorMessage} />
      </div>
    );
  }
}

const updateConfirmationAlert = (forceUpdate) => {
  const message = forceUpdate ? translate('offlineVersionCritical') : translate('offlineVersionOutdated');
  const downloadNotification = new Notification({
    message,
    origin: NOTIFICATION_ORIGIN_UPDATE_CHECK,
    severity: NOTIFICATION_SEVERITY_WARNING
  });
  const proceedWithDownload = new FollowUp({
    type: STATE_DOWNLOAD_UPDATE_CONFIRMED
  }, translate('Download'));
  const actions = [proceedWithDownload];
  return new ConfirmationAlert(downloadNotification, actions, true);
};

export default connect(
  state => ({
    forceUpdateToContinue: (state.ampConnectionStatusReducer && state.ampConnectionStatusReducer.status
      && state.ampConnectionStatusReducer.status.getLatestAmpOffline
      && state.ampConnectionStatusReducer.status.getLatestAmpOffline[MANDATORY_UPDATE] === true),
    suggestUpdateToContinue: (state.ampConnectionStatusReducer && state.ampConnectionStatusReducer.status
      && state.ampConnectionStatusReducer.status.getLatestAmpOffline
      && state.ampConnectionStatusReducer.status.getLatestAmpOffline[MANDATORY_UPDATE] === false)
  }),
  dispatch => ({
    onConfirmationAlert: (forceUpdate) => dispatch(addConfirmationAlert(updateConfirmationAlert(forceUpdate)))
  })
)(Login);
