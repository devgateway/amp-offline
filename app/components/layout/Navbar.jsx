/* eslint react/forbid-prop-types: 0 */
/* eslint react/jsx-space-before-closing: 0 */
import React, { Component, PropTypes } from 'react';
import Switcher from '../../components/i18n/Switcher';
import style from './Navbar.css';
import TopMenu from './TopMenu';
import * as MenuUtils from '../../utils/MenuUtils';
import Logout from '../login/Logout';

const defaultMenu = require('../../conf/menu.json');

export default class Navbar extends Component {

  static propTypes = {
    user: PropTypes.object.isRequired,
    login: PropTypes.object.isRequired,
    workspaceList: PropTypes.object.isRequired,
    menuOnClickHandler: PropTypes.object.isRequired,
    translation: PropTypes.object.isRequired,
    workspace: PropTypes.object.isRequired
  };

  extractLoggedUser(prepend) {
    console.log('extractLoggedUser');
    if (this.props.user instanceof Object && this.props.user.userData instanceof Object) {
      return prepend + this.props.user.userData.email;
    }
    return '';
  }

  extractWorkSpace(prepend) {
    console.log('extractWorkSpace');
    if (this.props.workspace && this.props.workspace.currentWorkspace) {
      return prepend + this.props.workspace.currentWorkspace.name;
    }
    return '';
  }

  render() {
    console.log('render');
    return (
      <div className={style.container}>
        <div className={style.navbar}>
          <a className={style.navbar_left_side} href="#">{VERSION}</a>
          <a className={style.navbar_left_side} href="#">{this.extractLoggedUser('')}</a>
          <a className={style.navbar_left_side} href="#">{this.extractWorkSpace('')}</a>
          <Switcher languages={this.props.translation.languageList}/>
          <Logout loggedIn={this.props.login.loggedIn}/>
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
