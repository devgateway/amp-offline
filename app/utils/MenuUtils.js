import translate from "./translate";
import UrlUtils from "./URLUtils";
import Menu, { SubMenu, MenuItem } from "rc-menu";
import React from "react";

class MenuUtils {

  constructor() {
    console.log('constructor');
  };


  buildMenu(loggedIn, menu, onClickHandler, workspaceList, menuOnClickHandler) {

    console.log('buildMenu');
    let topLevelMenu;
    const self = this;
    let firstLevelEntries = [];
    let nodes = {};
    for (let value of workspaceList) {
      nodes[value.name] = { 'objId': value.id, 'translation-type': 'content' };
    }
    menu.menu.DESKTOP.nodes['Change workspace'].nodes = nodes;

    if (menu.menu !== undefined && menu.menu !== null) {
      // Iterate first level items.
      Object.keys(menu.menu).forEach(function (key) {
        const firstLevelObject = menu.menu[key];
        if (toShow(firstLevelObject.public, loggedIn)) {
          let structure = generateTree(firstLevelObject, key, 0, [], loggedIn, menuOnClickHandler);
          firstLevelEntries.push(structure);
        }
      });
    }
    topLevelMenu = <Menu onClick={onClickHandler}>{firstLevelEntries}</Menu>;

    return React.cloneElement(topLevelMenu, {
      onOpenChange: this.onOpenChange,
      mode: 'horizontal',
      openAnimation: 'slide-up',
      openSubMenuOnMouseEnter: true,
      closeSubMenuOnMouseLeave: true,
    });
  }
}

export function handleClick(info) {
  console.log('handleClick');
  if (info.item.props.route) { // if it doesn't have a route, we invoke the menuClickHandler
    UrlUtils.forwardTo(info.item.props.route);
  } else {
    info.item.props.menuOnClickHandler(info.item.props.objId);
  }
}

function generateTree(object, key, level, node, loggedIn, menuOnClickHandler) {
  console.log('generateTree');
  const self = this;
  if (object.nodes) {
    node[level] = [];
    if (toShow(object.public, loggedIn)) {
      Object.keys(object.nodes).forEach(function (key) {
        if (toShow(object.nodes[key].public, loggedIn)) {
          node[level].push(generateTree(object.nodes[key], key, level + 1, node, loggedIn, menuOnClickHandler));
        }
      });
    }


    return <SubMenu title={_getTitle(object,key)} key={key}>{node[level]}</SubMenu>;
  } else {
    return <MenuItem title={_getTitle(object,key)} key={key} objId={object.objId}
                     menuOnClickHandler={menuOnClickHandler}
                     route={object.route}>{_getTitle(object, key)}</MenuItem>;
  }
}
function _getTitle(object, key) {
  let title;
  const menuTrnPrefix = "menu";
  if (object['translation-type'] && object['translation-type'] === 'content') {
    title = key;
  } else {
    title = translate(menuTrnPrefix + '.' + key);
  }
  return title;
}
// Export function so we can access it from outside (ie: from MenuUtil.spec.js).
export function toShow(isPublic, loggedIn) {
  console.log('toShow');
  /* Truth table:
   * true, true --> true
   * true, false --> true
   * false, true --> true
   * false, false --> false
   * */
  return isPublic || loggedIn;
}

export default MenuUtils;
