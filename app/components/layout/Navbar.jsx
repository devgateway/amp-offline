/* eslint react/forbid-prop-types: 0 */
/* eslint react/jsx-space-before-closing: 0 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { shell } from 'electron';
import translate from '../../utils/translate';
import style from './Navbar.css';
import TopMenuContainer from './TopMenu';
import * as MenuUtils from '../../utils/MenuUtils';
import Logout from '../login/Logout';
import LoggerManager from '../../modules/util/LoggerManager';
import { AMP_COUNTRY_LOGO, DESKTOP_CURRENT_URL } from '../../utils/Constants';
import AssetsUtils from '../../utils/AssetsUtils';
import NotificationsContainer from '../notifications';
import { STATE_CHECK_VERSION_DOWNLOAD_STOP } from './../../actions/StartUpAction';

const defaultMenu = require('../../conf/menu.json');

class Navbar extends Component {

  static propTypes = {
    userReducer: PropTypes.object.isRequired,
    loginReducer: PropTypes.object.isRequired,
    workspaceList: PropTypes.array.isRequired,
    menuOnClickHandler: PropTypes.func.isRequired,
    translationReducer: PropTypes.object.isRequired,
    workspaceReducer: PropTypes.object.isRequired,
    followCheckVersionUpdateLink: PropTypes.bool,
    onUpdateLinkOpen: PropTypes.func.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');
  }

  componentDidUpdate() {
    this.openUpdateLink();
  }

  extractLoggedUser(prepend) {
    LoggerManager.log('extractLoggedUser');
    if (this.props.userReducer instanceof Object && this.props.userReducer.userData instanceof Object) {
      return prepend + this.props.userReducer.userData.email;
    }
    return '';
  }

  extractWorkspace(prepend) {
    LoggerManager.log('extractWorkSpace');
    if (this.props.workspaceReducer && this.props.workspaceReducer.currentWorkspace) {
      return prepend + this.props.workspaceReducer.currentWorkspace.name;
    }
    return '';
  }

  openUpdateLink() {
    if (this.props.followCheckVersionUpdateLink === true) {
      shell.openExternal('https://github.com');
      this.props.onUpdateLinkOpen();
    }
  }

  render() {
    LoggerManager.log('render');
    return (
      <div className={style.container}>
        <div className={style.navbar}>
          <Link to={DESKTOP_CURRENT_URL}>
            <img
              alt="Logo"
              src={AssetsUtils.loadImage(AMP_COUNTRY_LOGO)}
              className={[style.countryFlag, style.navbar_left_side].join(' ')}
            />
          </Link>
          <Link className={style.navbar_left_side} style={{ cursor: 'pointer' }}>{translate('amp-title')}</Link>
          <Logout loggedIn={this.props.loginReducer.loggedIn} />
          <div className={style.userInfo}>
            <a className={style.navbar_left_side} >{this.extractLoggedUser('')}</a>
            <a className={style.navbar_left_side} >{this.extractWorkspace('')}</a>
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

export default connect(
  state => ({
    followCheckVersionUpdateLink: (state.startUpReducer.checkVersionData
      && state.startUpReducer.followCheckVersionUpdateLink === true)
  }),
  dispatch => ({
    onUpdateLinkOpen: () => dispatch({ type: STATE_CHECK_VERSION_DOWNLOAD_STOP })
  })
)(Navbar);
