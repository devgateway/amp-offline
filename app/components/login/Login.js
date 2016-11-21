// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

var pjson = require('../../../package.json');

export default class Login extends Component {

  // This seems to be a way to validate this component receives some props.
  static propTypes = {
    // This React component receives the login function to be dispatched as a prop,
    // so it doesnt have to know about the implementation.
    loginAction: PropTypes.func.isRequired
  };

  constructor() {
    super();

    console.log('app/components/login/Login.js - constructor()');

    this.state = {
      email: "",
      password: "",
      errorMessage: "",
      isProcessingLogin: false
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  render() {
    console.log('app/components/login/Login.js - render()');

    const {loginAction} = this.props;
    this.state.errorMessage = this.props.login.errorMessage || '';
    this.state.isProcessingLogin = this.props.login.loginProcessing;

    //TODO: split the login inputs and the navbar elements into smaller components.
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">{pjson.productName} - {pjson.version}</a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <form className="navbar-form navbar-right">
              <div className="form-group">
                <input type="text" value={this.state.email} onChange={this.handleEmailChange} className="form-control"/>
              </div>
              <div className="form-group">
                <input type="password" value={this.state.password} onChange={this.handlePasswordChange}
                       className="form-control"/>
              </div>
              <button type="button" className={'btn btn-success ' + (this.state.isProcessingLogin ? 'disabled' : '')}
                      onClick={() => {
                loginAction(this.state.email, this.state.password)
              } }>Log in
              </button>
              <div className={'alert alert-danger ' + (this.state.errorMessage === '' ? 'hidden' : '')}>
                <strong>Error: </strong> {this.state.errorMessage}
              </div>
            </form>
          </div>
        </div>
      </nav>
    );
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }
}
