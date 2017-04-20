/* eslint react/forbid-prop-types: 0 */
/* eslint react/jsx-space-before-closing: 0 */
import React, { Component, PropTypes } from 'react';
import Switcher from '../../components/i18n/Switcher';
import translate from '../../utils/translate';
import style from './Navbar.css';
import TopMenu from './TopMenu';
import * as MenuUtils from '../../utils/MenuUtils';
import Logout from '../login/Logout';
import LoggerManager from '../../modules/util/LoggerManager';
import UrlUtils from '../../utils/URLUtils';
import { WORKSPACE_URL, DESKTOP_URL,AMP_COUNTRY_LOGO } from '../../utils/Constants';
import AssetsUtils from '../../utils/AssetsUtils';

const defaultMenu = require('../../conf/menu.json');

export default class Navbar extends Component {

  static propTypes = {
    user: PropTypes.object.isRequired,
    login: PropTypes.object.isRequired,
    workspaceList: PropTypes.array.isRequired,
    menuOnClickHandler: PropTypes.func.isRequired,
    translation: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired
  };

  constructor() {
    super();
    LoggerManager.log('constructor');

    this.handleNavigation = this.handleNavigation.bind(this);
  }

  handleNavigation() {
    if (this.props.login.loggedIn) {
      console.log('esta logeado');
      console.log(this.props);
      debugger;
      const { currentWorkspace } = this.props.workspace;

      if (currentWorkspace && currentWorkspace.id) {
        // we have a team selected we go to the desktop
        return UrlUtils.forwardTo(`${DESKTOP_URL}/${currentWorkspace.id}`);
      } else {
        // no team selected we go to choose one
        UrlUtils.forwardTo(WORKSPACE_URL);
      }
    } else {
      // UrlUtils.forwardTo(LOGIN_URL);
    }
  }


  extractLoggedUser(prepend) {
    LoggerManager.log('extractLoggedUser');
    if (this.props.user instanceof Object && this.props.user.userData instanceof Object) {
      return prepend + this.props.user.userData.email;
    }
    return '';
  }

  extractWorkSpace(prepend) {
    LoggerManager.log('extractWorkSpace');
    if (this.props.workspace && this.props.workspace.currentWorkspace) {
      return prepend + this.props.workspace.currentWorkspace.name;
    }
    return '';
  }

  render() {
    LoggerManager.log('render');
    return (
      <div className={style.container}>
        <div className={style.navbar}>
          <img src={AssetsUtils.loadImage(AMP_COUNTRY_LOGO)}
               className={[style.countryFlag, style.navbar_left_side ].join(' ')} onClick={this.handleNavigation}/>
          {/* requirements dont mention verions I leave it incase we want to restore
           <a className={style.navbar_left_side} href="#">{VERSION}</a>*/}
          <a className={style.navbar_left_side} onClick={this.handleNavigation}
             style={{cursor: 'pointer'}}>{translate('amp-title')}</a>

          <Logout loggedIn={this.props.login.loggedIn}/>
          <Switcher languages={this.props.translation.languageList}/>
          <div className={style.userInfo}>
            <a className={style.navbar_left_side} >{this.extractLoggedUser('')}</a>
            <a className={style.navbar_left_side} >{this.extractWorkSpace('')}</a>
          </div>


        </div>
        <div className={style.main_menu}>
          <TopMenu
            builder={MenuUtils.default.prototype.buildMenu}
            onClick={MenuUtils.handleClick}
            loggedIn={this.props.login.loggedIn}
            workspaceList={this.props.workspaceList}
            menu={defaultMenu}
            menuOnClickHandler={this.props.menuOnClickHandler}
            languageList={this.props.translation.languageList}
          />
        </div>
      </div>
    );
  }
}
