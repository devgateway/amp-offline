import translate from './translate';
import UrlUtils from './URLUtils'
import Menu, {SubMenu, Item as MenuItem, Divider} from 'rc-menu';
import animate from 'css-animation';
import React from 'react';

class MenuUtils {

  constructor() {
    console.log('MenuUtils');
  };

  buildMenu(loggedIn) {
    const defaultMenu = require('../conf/menu.json');
    let topLevelMenu;
    const self = this;
    let firstLevelEntries = [];
    if (defaultMenu.menu !== undefined && defaultMenu.menu !== null) {
      // Iterate first level items.
      Object.keys(defaultMenu.menu).forEach(function (key) {
        let firstLevelObject = defaultMenu.menu[key];
        if (toShow(firstLevelObject.public, loggedIn)) {
          let structure = generateTree(firstLevelObject, key, 0, [], loggedIn);
          firstLevelEntries.push(structure);
        }
      });
    }
    topLevelMenu = (<Menu onClick={handleClick}>{firstLevelEntries}</Menu>);

    return React.cloneElement(topLevelMenu, {
      onOpenChange: this.onOpenChange,
      mode: 'horizontal',
      openAnimation: 'slide-up',
      openSubMenuOnMouseEnter: true,
      closeSubMenuOnMouseLeave: true,
    });
  }
}

function handleClick(info) {
  console.log('handleClick');
  if (info.item.props.route) {
    UrlUtils.forwardTo(info.item.props.route);
  }
}

function generateTree(object, key, level, node, loggedIn) {
  const self = this;
  const menuTrnPrefix = "menu";
  if (object.nodes) {
    node[level] = [];
    if (toShow(object.public, loggedIn)) {
      Object.keys(object.nodes).forEach(function (key) {
        if (toShow(object.nodes[key].public, loggedIn)) {
          node[level].push(generateTree(object.nodes[key], key, level + 1, node, loggedIn));
        }
      });
    }
    return (<SubMenu title={translate(menuTrnPrefix + '.' + key)} key={key}>{node[level]}</SubMenu>);
  } else {
    return (<MenuItem title={translate(menuTrnPrefix + '.' + key)} key={key}
                      route={object.route}>{translate(menuTrnPrefix + '.' + key)}</MenuItem>);
  }
}

function toShow(isPublic, loggedIn) {
  /* Truth table:
   * true, true --> true
   * true, false --> true
   * false, true --> true
   * false, false --> false
   * */
  return isPublic || loggedIn;
}

export default MenuUtils;
