import translate from './translate';
import UrlUtils from './URLUtils'
import Menu, {SubMenu, Item as MenuItem, Divider} from 'rc-menu';
import animate from 'css-animation';
import React from 'react';

const menuUtils = {

  handleClick(info) {
    console.log('handleClick');
    if (info.item.props.route) {
      UrlUtils.forwardTo(info.item.props.route);
    }
  },

  //TODO: make this menu work with N levels.
  buildMenu(loggedIn) {
    const defaultMenu = require('../conf/menu.json');
    let topLevelMenu;
    let self = this;
    const menuTrnPrefix = 'menu';
    let firstLevelEntries = [];
    Object.keys(defaultMenu.menu).forEach(function (key) {
      let obj = defaultMenu.menu[key];
      let secondLevelEntries = [];
      if (obj.nodes) {
        Object.keys(obj.nodes).forEach(function (key2) {
          let thirdLevelEntries = [];
          let subMenu = false;
          if (obj.nodes[key2].nodes) {
            subMenu = true;
            Object.keys(obj.nodes[key2].nodes).forEach(function (key3) {
              if (self.checkIfPublic(obj.nodes[key2].nodes[key3].public, loggedIn)) {
                thirdLevelEntries.push(<MenuItem key={key3}
                                                 route={obj.nodes[key2].nodes[key3].route}>{translate(menuTrnPrefix + '.' + key3)}</MenuItem>);
              }
            });
          } else {
            if (self.checkIfPublic(obj.nodes[key2].public, loggedIn)) {
              thirdLevelEntries = translate(menuTrnPrefix + '.' + key2);
            }
          }
          if (self.checkIfPublic(obj.nodes[key2].public, loggedIn)) {
            if (subMenu) {
              secondLevelEntries.push(<SubMenu title={translate(menuTrnPrefix + '.' + key2)}
                                               key={key2}>{thirdLevelEntries}</SubMenu>);
            } else {
              secondLevelEntries.push(<MenuItem key={key2}
                                                route={obj.nodes[key2].route}>{thirdLevelEntries}</MenuItem>);
            }
          }
        });
      }
      if (self.checkIfPublic(obj.public, loggedIn)) {
        firstLevelEntries.push((
          <SubMenu title={<span>{translate(menuTrnPrefix + '.' + key)}</span>}
                   key={key}>{secondLevelEntries}</SubMenu>));
      }
    });
    topLevelMenu = (<Menu onClick={self.handleClick}>{firstLevelEntries}</Menu>);

    return React.cloneElement(topLevelMenu, {
      onOpenChange: this.onOpenChange,
      mode: 'horizontal',
      openAnimation: 'slide-up',
      openSubMenuOnMouseEnter: true,
      closeSubMenuOnMouseLeave: true,
    });
  },

  checkIfPublic(isPublic, loggedIn) {
    /* Truth table:
     * true, true --> true
     * true, false --> true
     * false, true --> true
     * false, false --> false
     * */
    return isPublic || loggedIn;
  }
};

module.exports = menuUtils;
