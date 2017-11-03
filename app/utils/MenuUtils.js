import React from 'react';
import Menu, { SubMenu, MenuItem } from 'rc-menu';
import translate from './translate';
import UrlUtils from './URLUtils';
import { setLanguage } from '../actions/TranslationAction';
import store from '../index';
import { NEW_ACTIVITY_ID } from './constants/ValueConstants';
import { ADD_ACTIVITY, MY_DESKTOP } from './constants/MenuConstants';
import Logger from '../modules/util/LoggerManager';
import { didSetupComplete } from '../actions/SetupAction';

const logger = new Logger('Menu utils');

const cloneDeep = obj => JSON.parse(JSON.stringify(obj));

class MenuUtils {

  constructor() {
    logger.debug('constructor');
  }

  buildMenu(loggedIn, menu, onClickHandler, workspaceReducer, menuOnClickHandler, languageList) {
    logger.log('buildMenu');
    const { workspaceList } = workspaceReducer;
    const firstLevelEntries = [];
    const isSetupComplete = didSetupComplete();
    const newMenu = cloneDeep(menu);

    // Dynamic list of workspaces.
    if (newMenu.menu.DESKTOP) {
      const nodes = {};
      workspaceList.forEach(value => (
        nodes[value.name] = { objId: value.id, 'translation-type': 'content' }
      ));
      newMenu.menu.DESKTOP.nodes['Change workspace'].nodes = nodes;

      if (!workspaceReducer.currentWorkspace || !workspaceReducer.currentWorkspace['add-activity']) {
        delete newMenu.menu.DESKTOP.nodes[ADD_ACTIVITY];
      } else {
        const addActivityRoute = newMenu.menu.DESKTOP.nodes[ADD_ACTIVITY].route;
        newMenu.menu.DESKTOP.nodes[ADD_ACTIVITY].route = addActivityRoute.replace('NEW_ACTIVITY_ID', NEW_ACTIVITY_ID);
      }
      if (!workspaceReducer.currentWorkspace) {
        delete newMenu.menu.DESKTOP.nodes[MY_DESKTOP];
      }
    }

    // Dynamic list of languages with its own click handler.
    if (newMenu.menu.TOOLS) {
      const langNodes = {};
      languageList.forEach(value => (langNodes[value] = {
        objId: value,
        public: true,
        beforeSetup: true,
        onItemClickHandler: ((lang) => {
          store.dispatch(setLanguage(lang));
        })
      }));
      newMenu.menu.TOOLS.nodes['Change Language'].nodes = langNodes;
    }

    if (newMenu.menu !== undefined && newMenu.menu !== null) {
      // Iterate first level items.
      Object.keys(newMenu.menu).forEach((key) => {
        const firstLevelObject = newMenu.menu[key];
        if (toShow(firstLevelObject, loggedIn, isSetupComplete)) {
          const structure = generateTree(firstLevelObject, key, 0, [], loggedIn, isSetupComplete, menuOnClickHandler);
          firstLevelEntries.push(structure);
        }
      });
    }
    const topLevelMenu = <Menu onClick={onClickHandler}>{firstLevelEntries}</Menu>;

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
  logger.debug('handleClick');
  if (info.item.props.route) { // if it doesn't have a route, we invoke a ClickHandler
    UrlUtils.forwardTo(info.item.props.route);
  } else if (info.item.props.onItemClickHandler) {
    info.item.props.onItemClickHandler(info.item.props.objId);
  } else {
    info.item.props.menuOnClickHandler(info.item.props.objId);
  }
}

function generateTree(object, key, level, node, loggedIn, isSetupComplete, menuOnClickHandler) {
  // logger.log('generateTree');
  const newNode = Object.assign({}, node);
  if (object.nodes) {
    newNode[level] = [];
    if (toShow(object, loggedIn, isSetupComplete)) {
      Object.keys(object.nodes).forEach((key2) => {
        if (toShow(object.nodes[key2], loggedIn, isSetupComplete)) {
          newNode[level].push(generateTree(object.nodes[key2], key2, level + 1, newNode, loggedIn,
            isSetupComplete, menuOnClickHandler));
        }
      });
    }
    return <SubMenu title={_getTitle(object, key)} key={key}>{newNode[level]}</SubMenu>;
  }
  return (
    <MenuItem
      title={_getTitle(object, key)}
      key={key}
      objId={object.objId}
      menuOnClickHandler={menuOnClickHandler}
      route={object.route}
      onItemClickHandler={object.onItemClickHandler}
    >{_getTitle(object, key)}</MenuItem>);
}

function _getTitle(object, key) {
  let title;
  if (object['translation-type'] && object['translation-type'] === 'content') {
    title = key;
  } else {
    title = translate(key);
  }
  return title;
}

// Export function so we can access it from outside (ie: from MenuUtil.spec.js).
export function toShow(menu, loggedIn, isSetupComplete) {
  return (menu.public || loggedIn) && (menu.beforeSetup || isSetupComplete);
}

export default MenuUtils;
