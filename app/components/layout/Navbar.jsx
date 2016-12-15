// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Switcher from '../../components/i18n/Switcher';
import style from './Home.css';

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
        <Link to="syncUp" >Sync upd</Link>
        <div className="container">
          <div className={style.main_menu}>
            <a className="navbar-brand" href="#">{pjson.productName} - {pjson.version}</a>
            <a className="navbar-brand"
               href="#">{this.extractLoggedUser(' - ')}</a>
            <Switcher/>
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
