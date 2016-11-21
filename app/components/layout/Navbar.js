// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

const pjson = require('../../../package.json');

export default class Navbar extends Component {

  constructor() {
    super();
  }

  render() {
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">{pjson.productName} - {pjson.version}</a>
          </div>
        </div>
      </nav>
    );
  }
}
