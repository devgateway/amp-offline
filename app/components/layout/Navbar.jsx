// @flow
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Switcher from '../../components/i18n/Switcher';
import style from './Navbar.css';
import translate from '../../utils/translate';
import TopMenu from './TopMenu';

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
      <div className={style.container}>
        <div className={style.navbar}>
          <a className={style.navbar_left_side} href="#">{pjson.productName} - {pjson.version}</a>
          <a className={style.navbar_left_side} href="#">{this.extractLoggedUser(' - ')}</a>
          <Switcher/>
        </div>
        <div className={style.main_menu}>
          <TopMenu/>
        </div>
      </div>
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
