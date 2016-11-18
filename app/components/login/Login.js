// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

var pjson = require('../../../package.json');

export default class Login extends Component {

  // This seems to be a way to validate this component receives some props.
  static propTypes = {
    login: PropTypes.func.isRequired
  };

  constructor() {
    super();

    this.state = {
      email: "",
      password: ""
    };

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  render() {
    const {login} = this.props;

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
              <button type="button" className="btn btn-success" onClick={() => {
                login(this.state)
              } }>Log in
              </button>
              <Link to="/">Back...</Link>
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
