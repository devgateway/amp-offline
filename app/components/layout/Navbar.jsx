import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import translate from '../../utils/translate';
import style from './Navbar.css';
import TopMenuContainer from './TopMenu';
import * as MenuUtils from '../../utils/MenuUtils';
import Logout from '../login/Logout';
import Logger from '../../modules/util/LoggerManager';
import { AMP_COUNTRY_LOGO, DESKTOP_CURRENT_URL } from '../../utils/Constants';
import AssetsUtils from '../../utils/AssetsUtils';
import NotificationsContainer from '../notifications';

const logger = new Logger('Navbar');

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
    logger.log('constructor');
  }

  extractLoggedUser(prepend) {
    logger.log('extractLoggedUser');
    if (this.props.userReducer instanceof Object && this.props.userReducer.userData instanceof Object) {
      return prepend + this.props.userReducer.userData.email;
    }
    return '';
  }

  extractWorkspace(prepend) {
    logger.log('extractWorkSpace');
    if (this.props.workspaceReducer && this.props.workspaceReducer.currentWorkspace) {
      return prepend + this.props.workspaceReducer.currentWorkspace.name;
    }
    return '';
  }

  render() {
    logger.log('render');
    return (
      <div className={style.container}>
        <div className={style.navbar}>
          <Link to={DESKTOP_CURRENT_URL}>
            <img
              alt="Logo"
              src={AssetsUtils.loadImage(AMP_COUNTRY_LOGO)}
              className={[style.countryFlag, style.navbar_left_side].join(' ')}
            />
            <a className={style.navbar_left_side}>{translate('amp-title')}</a>
          </Link>
          <div className={style.userInfo}>
            <Logout loggedIn={this.props.loginReducer.loggedIn} translationReducer={this.props.translationReducer} />
            <a className={style.navbar_right_side}>{this.extractLoggedUser('')}</a>
            <a className={style.navbar_right_side}>{this.extractWorkspace('')}</a>
          </div>
        </div>
        <div className={style.main_menu}>
          <TopMenuContainer
            builder={MenuUtils.default.prototype.buildMenu}
            onClick={MenuUtils.handleClick}
            loggedIn={this.props.loginReducer.loggedIn}
            workspaceList={this.props.workspaceList}
            menu={defaultMenu}
            menuOnClickHandler={this.props.menuOnClickHandler}
            languageList={this.props.translationReducer.languageList}
          />
        </div>
        <NotificationsContainer />
      </div>
    );
  }
}
