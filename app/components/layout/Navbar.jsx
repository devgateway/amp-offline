import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Constants } from 'amp-ui';
import translate from '../../utils/translate';
import style from './Navbar.css';
import TopMenuContainer from './TopMenu';
import * as MenuUtils from '../../utils/MenuUtils';
import Logout from '../login/Logout';
import Logger from '../../modules/util/LoggerManager';
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
    logger.debug('constructor');
  }

  extractLoggedUser(prepend) {
    logger.debug('extractLoggedUser');
    if (this.props.userReducer instanceof Object && this.props.userReducer.userData instanceof Object) {
      return prepend + this.props.userReducer.userData.email;
    }
    return '';
  }

  extractWorkspace(prepend) {
    logger.debug('extractWorkSpace');
    if (this.props.workspaceReducer && this.props.workspaceReducer.currentWorkspace) {
      return prepend + this.props.workspaceReducer.currentWorkspace.name;
    }
    return '';
  }

  render() {
    logger.debug('render');
    return (
      <div className={style.container}>
        <div className={style.navbar}>
          <Link to={Constants.DESKTOP_CURRENT_URL}>
            <img
              alt="Logo"
              src={AssetsUtils.loadImage(Constants.AMP_COUNTRY_LOGO)}
              className={[style.countryFlag, style.navbar_left_side].join(' ')}
            />
            <span className={style.navbar_left_side}>{translate('amp-title')}</span>
          </Link>
          <div className={style.userInfo}>
            <Logout loggedIn={this.props.loginReducer.loggedIn} {...this.props} />
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
