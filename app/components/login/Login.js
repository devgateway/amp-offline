// @flow
import React, {Component} from 'react';

var pjson = require('../../../package.json');

export default class HomePage extends Component {

  constructor() {
    super();
    this.state = {
      email: null,
      password: null,
    };
  }

  render() {
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">{pjson.productName} - {pjson.version}</a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <form className="navbar-form navbar-right">
              <div className="form-group">
                <input type="text" placeholder="Email" className="form-control"/>
              </div>
              <div className="form-group">
                <input type="password" placeholder="Password" className="form-control"/>
              </div>
              <button type="submit" className="btn btn-success">Sign in</button>
            </form>
          </div>
        </div>
      </nav>
    );
  }
}
