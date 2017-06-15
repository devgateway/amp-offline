/* eslint react/forbid-prop-types: 0 */
/* eslint react/jsx-space-before-closing: 0 */
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import translate from '../../utils/translate';
import style from './Navbar.css';
import topMenu from './TopMenu';
import * as MenuUtils from '../../utils/MenuUtils';
import Logout from '../login/Logout';
import LoggerManager from '../../modules/util/LoggerManager';
import { AMP_COUNTRY_LOGO, DESKTOP_CURRENT_URL } from '../../utils/Constants';
import AssetsUtils from '../../utils/AssetsUtils';

const defaultMenu = require('../../conf/menu.json');

export default class Navbar extends Component {

  static propTypes = {
    userReducer: PropTypes.object.isRequired,
    loginReducer: PropTypes.object.isRequired,
    workspaceList: PropTypes.array.isRequired,
    menuOnClickHandler: PropTypes.func.isRequired,
    translationReducer: PropTypes.object.isRequired,
    workspaceReducer: PropTypes.object.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  extractLoggedUser(prepend) {
    LoggerManager.log('extractLoggedUser');
    if (this.props.userReducer instanceof Object && this.props.userReducer.userData instanceof Object) {
      return prepend + this.props.userReducer.userData.email;
    }
    return '';
  }

  extractWorkSpace(prepend) {
    LoggerManager.log('extractWorkSpace');
    if (this.props.workspaceReducer && this.props.workspaceReducer.currentWorkspace) {
      return prepend + this.props.workspaceReducer.currentWorkspace.name;
    }
    return '';
  }

  render() {
    LoggerManager.log('render');
    return (
      <div className={style.container}>
        <div className={style.navbar}>
          <Link to={DESKTOP_CURRENT_URL}>
            <img
              src={AssetsUtils.loadImage(AMP_COUNTRY_LOGO)} alt="logo"
              className={[style.countryFlag, style.navbar_left_side].join(' ')} /></Link>
          <Link
            className={style.navbar_left_side}
            style={{ cursor: 'pointer' }}>{translate('amp-title')}</Link>

          <Logout loggedIn={this.props.loginReducer.loggedIn} />
          <div className={style.userInfo}>
            <a className={style.navbar_left_side} >{this.extractLoggedUser('')}</a>
            <a className={style.navbar_left_side} >{this.extractWorkSpace('')}</a>
          </div>


        </div>
        <div className={style.main_menu}>
          <topMenu
            builder={MenuUtils.default.prototype.buildMenu}
            onClick={MenuUtils.handleClick}
            loggedIn={this.props.loginReducer.loggedIn}
            workspaceList={this.props.workspaceList}
            menu={defaultMenu}
            menuOnClickHandler={this.props.menuOnClickHandler}
            languageList={this.props.translationReducer.languageList}
          />
        </div>
      </div>
    );
  }
}
