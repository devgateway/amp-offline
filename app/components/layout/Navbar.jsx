// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

const pjson = require('../../../package.json');

export default class Navbar extends Component {

  static propTypes = {
    user: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  render() {
    console.log('render');
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">{pjson.productName} - {pjson.version}</a>
            <a className="navbar-brand"
               href="#">{this.extractLoggedUser(' - ')}</a>
          </div>
        </div>
      </nav>
    );
  }

  extractLoggedUser(prepend) {
    console.log('extractLoggedUser');
    if (this.props.user instanceof Object && this.props.user.loggedUser instanceof Object) {
      return prepend + this.props.user.loggedUser['user-name'];
    }
    return '';
  }
}
