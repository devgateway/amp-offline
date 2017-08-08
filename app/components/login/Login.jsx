import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import styles from './Login.css';
import ErrorMessage from '../common/ErrorMessage';
import Span from '../i18n/Span';
import Button from '../i18n/Button';
import LoggerManager from '../../modules/util/LoggerManager';
import { MANDATORY_UPDATE } from '../../modules/util/VersionCheckManager';
import FollowUp from '../../components/notifications/followup';
import ConfirmationAlert from '../../components/notifications/confirmationAlert';
import Notification from '../../modules/helpers/NotificationHelper';
import { addConfirmationAlert } from '../../actions/NotificationAction';
import { NOTIFICATION_ORIGIN_UPDATE_CHECK, NOTIFICATION_SEVERITY_INFO } from '../../utils/constants/ErrorConstants';
import translate from '../../utils/translate';
import { STATE_CHECK_VERSION_DOWNLOAD_START } from './../../actions/StartUpAction';

class Login extends Component {

  // This seems to be a way to validate this component receives some props.
  static propTypes = {
    // This React component receives the login function to be dispatched as a prop,
    // so it doesnt have to know about the implementation.
    loginAction: PropTypes.func.isRequired,
    loginReducer: PropTypes.object.isRequired,
    forceUpdateToContinue: PropTypes.bool,
    suggestUpdateToContinue: PropTypes.bool,
    updateAlertMessage: PropTypes.string,
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
      this.props.onConfirmationAlert(this.props.updateAlertMessage);
    } else {
      if (this.props.suggestUpdateToContinue === true) {
        this.props.onConfirmationAlert(this.props.updateAlertMessage);
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
            this.processLogin(this.state.email, this.state.password);
          }} text="login" />
        <hr />
        <ErrorMessage message={this.props.loginReducer.errorMessage} />
      </div>
    );
  }
}

const updateConfirmationAlert = (message) => {
  const downloadNotification = new Notification({
    message,
    origin: NOTIFICATION_ORIGIN_UPDATE_CHECK,
    severity: NOTIFICATION_SEVERITY_INFO
  });
  const proceedWithDownload = new FollowUp({
    type: STATE_CHECK_VERSION_DOWNLOAD_START
  }, translate('Download'));
  const actions = [proceedWithDownload];
  return new ConfirmationAlert(downloadNotification, actions, true);
};

export default connect(
  state => ({
    forceUpdateToContinue: (state.startUpReducer.checkVersionData
      && state.startUpReducer.checkVersionData[MANDATORY_UPDATE] === true),
    suggestUpdateToContinue: (state.startUpReducer.checkVersionData
      && state.startUpReducer.checkVersionData[MANDATORY_UPDATE] === false),
    updateAlertMessage: (state.startUpReducer.checkVersionData && state.startUpReducer.checkVersionData.updateMessage),
    updateURL: (state.startUpReducer.checkVersionData
      && state.startUpReducer.checkVersionData['latest-amp-offline'].url),
    followCheckVersionUpdateLink: (state.startUpReducer.checkVersionData
      && state.startUpReducer.followCheckVersionUpdateLink === true)
  }),
  dispatch => ({
    onConfirmationAlert: (message) => dispatch(addConfirmationAlert(updateConfirmationAlert(message)))
  })
)(Login);
