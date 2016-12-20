// @flow
import React, {Component, PropTypes} from 'react';
import Menu, {SubMenu, Item as MenuItem, Divider} from 'rc-menu';
import animate from 'css-animation';
import translate from '../../utils/translate';
import {connect} from 'react-redux';

class TopMenu extends Component {

  constructor() {
    super();
    console.log('constructor');
  }

  handleSelect(info) {
    console.log(info);
    console.log('selected ${info.key}');
  }

  render() {
    console.log('render');
    return this.buildMenu();
  }

  //TODO: make this menu work with N levels!!!
  buildMenu() {
    const defaultMenu = require('../../conf/menu.json');
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
              if (self.checkIfPublic(obj.public)) {
                thirdLevelEntries.push(<MenuItem key={key3}>{translate(menuTrnPrefix + '.' + key3)}</MenuItem>);
              }
            });
          } else {
            if (self.checkIfPublic(obj.public)) {
              thirdLevelEntries = translate(menuTrnPrefix + '.' + key2);
            }
          }
          if (self.checkIfPublic(obj.public)) {
            if (subMenu) {
              secondLevelEntries.push(<SubMenu title={translate(menuTrnPrefix + '.' + key2)}
                                               key={key2}>{thirdLevelEntries}</SubMenu>);
            } else {
              secondLevelEntries.push(<MenuItem key={key2}>{thirdLevelEntries}</MenuItem>);
            }
          }
        });
      }
      if (self.checkIfPublic(obj.public)) {
        firstLevelEntries.push((
          <SubMenu title={<span>{translate(menuTrnPrefix + '.' + key)}</span>}
                   key={key}>{secondLevelEntries}</SubMenu>));
      }
    });
    topLevelMenu = (<Menu onSelect={self.handleSelect}>{firstLevelEntries}</Menu>);

    return React.cloneElement(topLevelMenu, {
      onOpenChange: this.onOpenChange,
      mode: 'horizontal',
      openAnimation: 'slide-up',
      openSubMenuOnMouseEnter: true,
      closeSubMenuOnMouseLeave: true,
    });
  }

  checkIfPublic(isPublic) {
    const loggedIn = this.props.login.loggedIn;
    let show = false;
    if (isPublic === true) {
      show = true;
    } else {
      if (loggedIn === true) {
        show = true;
      } else {
        show = false;
      }
    }
    return show;
  }
}

// We link this component with Redux to detect when the language changes.
const mapStateToProps = (state, props) => {
  console.log('mapStateToProps');
  return state;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('mapDispatchToProps');
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(TopMenu);
