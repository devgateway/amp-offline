// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import styles from './Login.css';
import ErrorMessage from '../common/ErrorMessage';
import Span from '../i18n/Span';
import Button from '../i18n/Button';

export default class Login extends Component {

  // This seems to be a way to validate this component receives some props.
  static propTypes = {
    // This React component receives the login function to be dispatched as a prop,
    // so it doesnt have to know about the implementation.
    loginAction: PropTypes.func.isRequired
  };

  constructor() {
    super();

    console.log('constructor');

    this.state = {
      email: '',
      password: '',
      errorMessage: '',
      isProcessingLogin: false
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  render() {
    console.log('render');

    const {loginAction} = this.props;
    this.state.errorMessage = this.props.login.errorMessage || '';
    this.state.isProcessingLogin = this.props.login.loginProcessing;

    return (
      <div className={styles.centered_form}>
        <table>
          <tr>
            <td>User:</td>
            <td><input type="text" value={this.state.email} onChange={this.handleEmailChange} className="form-control"/>
            </td>
          </tr>
          <tr>
            <td>Password:</td>
            <td><input type="password" value={this.state.password} onChange={this.handlePasswordChange}
                       className="form-control"/></td>
          </tr>
        </table>
        <button type="button" className={'btn btn-success ' + (this.state.isProcessingLogin ? 'disabled' : '')} onClick={() => {
            loginAction(this.state.email, this.state.password)
          }}>Log in
        </button>
        <hr/>
        <ErrorMessage message={this.state.errorMessage}/>
      </div>
    );
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }
}
