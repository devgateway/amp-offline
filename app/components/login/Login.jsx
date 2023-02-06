/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Login.css';
import ErrorMessage from '../common/ErrorMessage';
import Span from '../i18n/Span';
import Button from '../i18n/Button';
import Logger from '../../modules/util/LoggerManager';
import translate from '../../utils/translate';
import LoginTroubleshootingLinks from './LoginTroubleshootingLinks';
import { doSetupFirst } from '../../actions/SetupAction';
import * as Utils from '../../utils/Utils';
import DBMigrationProgressDialogModal from '../dbMigration/DBMigrationProgressDialogModal';

const logger = new Logger('login');

export default class Login extends Component {

  // This seems to be a way to validate this component receives some props.
  static propTypes = {
    // This React component receives the login function to be dispatched as a prop,
    // so it doesnt have to know about the implementation.
    loginAction: PropTypes.func.isRequired,
    loginReducer: PropTypes.object.isRequired,
    changePasswordOnline: PropTypes.func.isRequired,
    resetPasswordOnline: PropTypes.func.isRequired,
    isSetupComplete: PropTypes.bool,

  };

  constructor(args) {
    super(args);
    logger.debug('constructor');

    this.state = Utils.isReleaseBranch() ? {} : {
      email: process.env.AMP_TEST_USER,
      password: process.env.AMP_TEST_PASSWORD
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.processKeyPress = this.processKeyPress.bind(this);
  }

  componentWillMount() {
    this.checkIfSetupComplete(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkIfSetupComplete(nextProps);
  }

  checkIfSetupComplete(props) {
    const { isSetupComplete } = props;
    if (isSetupComplete === false) {
      doSetupFirst();
    }
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  processLogin(email = this.state.email.toLowerCase(), password = this.state.password) {
    this.props.loginAction(email, password);
  }

  processKeyPress(e) {
    // https://www.w3.org/TR/uievents-key/#keys-whitespace
    if (e.key === 'Enter') {
      this.processLogin();
    }
  }

  render() {
    logger.debug('render');
    const { isSetupComplete } = this.props;
    if (isSetupComplete !== true) {
      return null;
    }
    return (
      <div className={styles.centered_form}>
        <table>
          <tbody>
            <tr>
              <td><Span text={translate('User')} /></td>
              <td>
                <input
                  type="text" value={this.state.email} onChange={this.handleEmailChange}
                  className="form-control" onKeyPress={this.processKeyPress} />
              </td>
            </tr>
            <tr>
              <td><Span text={translate('password')} /></td>
              <td>
                <input
                  type="password" value={this.state.password} onChange={this.handlePasswordChange}
                  className="form-control" onKeyPress={this.processKeyPress} />
              </td>
            </tr>
          </tbody>
        </table>
        <Button
          type="button" className={`btn btn-success ${(this.props.loginReducer.loginProcessing ? 'disabled' : '')}`}
          onClick={() => {
            this.processLogin();
          }} text={translate('login')} />
        <hr />
        <LoginTroubleshootingLinks
          changePasswordOnline={this.props.changePasswordOnline}
          resetPasswordOnline={this.props.resetPasswordOnline} />
        <br />
        {!this.props.loginReducer.loginProcessing ?
          <ErrorMessage message={this.props.loginReducer.errorMessage} /> : null}
        <DBMigrationProgressDialogModal show={this.props.loginReducer.showDBMigrationMessage} />
      </div>
    );
  }
}
