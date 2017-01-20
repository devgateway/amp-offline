// @flow
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Switcher from '../../components/i18n/Switcher';
import style from './Navbar.css';
import translate from '../../utils/translate';
import TopMenu from './TopMenu';
import * as MenuUtils from '../../utils/MenuUtils';
import Logout from '../login/Logout';

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
    const defaultMenu = require('../../conf/menu.json');
    return (
      <div className={style.container}>
        <div className={style.navbar}>
          <a className={style.navbar_left_side} href="#">{pjson.productName} - {VERSION}</a>
          <a className={style.navbar_left_side} href="#">{this.extractLoggedUser(' - ')}</a>
          <Switcher/>
          <Logout loggedIn={this.props.login.loggedIn}/>
        </div>
        <div className={style.main_menu}>
          <TopMenu builder={MenuUtils.default.prototype.buildMenu} onClick={MenuUtils.handleClick}
                   loggedIn={this.props.login.loggedIn} menu={defaultMenu}/>
        </div>
      </div>
    );
  }

  extractLoggedUser(prepend) {
    console.log('extractLoggedUser');
    if (this.props.user instanceof Object && this.props.user.userData instanceof Object) {
      return prepend + this.props.user.userData.email;
    }
    return '';
  }
}
