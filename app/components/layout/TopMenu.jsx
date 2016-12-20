// @flow
import React, {Component, PropTypes} from 'react';
import Menu, {SubMenu, Item as MenuItem, Divider} from 'rc-menu';
import animate from 'css-animation';

export default class TopMenu extends Component {

  static propTypes = {
    user: PropTypes.object.isRequired
  };

  constructor() {
    super();
    console.log('constructor');
  }

  handleSelect(info) {
    console.log(info);
    console.log(`selected ${info.key}`);
  }

  render() {
    console.log('render');

    const defaultMenu = require('../../conf/menu.json');
    let topLevelMenu;
    let self = this;

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
              if (obj.nodes[key2].nodes[key3].nodes) {
                thirdLevelEntries.push(<MenuItem key={key3}>{key3}</MenuItem>);
              } else {
                thirdLevelEntries.push(<MenuItem key={key3}>{key3}</MenuItem>);
              }
            });
          } else {
            thirdLevelEntries = key2;
          }
          if (subMenu) {
            secondLevelEntries.push(<SubMenu title={key2} key={key2}>{thirdLevelEntries}</SubMenu>);
          } else {
            secondLevelEntries.push(<MenuItem key={key2}>{thirdLevelEntries}</MenuItem>);
          }
        });
      }
      firstLevelEntries.push((<SubMenu title={<span>{key}</span>} key={key}>{secondLevelEntries}</SubMenu>));
    });
    topLevelMenu = (<Menu onSelect={self.handleSelect}>{firstLevelEntries}</Menu>);


    /*const topLevelMenu = (<Menu onSelect={this.handleSelect}>
     <SubMenu title={<span>sub menu</span>} key="1">
     <MenuItem key="1-1">0-1</MenuItem>
     <MenuItem key="1-2">0-2</MenuItem>
     </SubMenu>
     {nestSubMenu}
     <MenuItem key="2">1</MenuItem>
     <MenuItem key="3">outer</MenuItem>
     <MenuItem disabled>disabled</MenuItem>
     <MenuItem key="5">outer3</MenuItem>
     </Menu>);*/

    const nestSubMenu = (<SubMenu title={<span>sub menu 2</span>} key="4">
      <MenuItem key="4-1">inner inner</MenuItem>
      <Divider/>
      <SubMenu key="4-2" title={<span>sub menu 3</span>}>
        <SubMenu title="sub 4-2-0" key="4-2-0">
          <MenuItem key="4-2-0-1">inner inner</MenuItem>
          <MenuItem key="4-2-0-2">inner inner2</MenuItem>
        </SubMenu>
        <MenuItem key="4-2-1">inn</MenuItem>
        <SubMenu title={<span>sub menu 4</span>} key="4-2-2">
          <MenuItem key="4-2-2-1">inner inner</MenuItem>
          <MenuItem key="4-2-2-2">inner inner2</MenuItem>
        </SubMenu>
        <SubMenu title="sub 4-2-3" key="4-2-3">
          <MenuItem key="4-2-3-1">inner inner</MenuItem>
          <MenuItem key="4-2-3-2">inner inner2</MenuItem>
        </SubMenu>
      </SubMenu>
    </SubMenu>);

    /*const subMenus = (<Menu>
     <SubMenu title={<span>sub menu</span>} key="1">
     <MenuItem key="1-1">0-1</MenuItem>
     <MenuItem key="1-2">0-2</MenuItem>
     </SubMenu>
     <SubMenu title={<span>sub menu 1</span>} key="2">
     <MenuItem key="2-1">2-1</MenuItem>
     <MenuItem key="2-2">2-2</MenuItem>
     </SubMenu>
     {nestSubMenu}
     </Menu>);*/

    return React.cloneElement(topLevelMenu, {
      onOpenChange: this.onOpenChange,
      /*openKeys: this.state.openKeys,*/
      mode: 'horizontal',
      openAnimation: 'slide-up',
      openSubMenuOnMouseEnter: false,
      closeSubMenuOnMouseLeave: false,
    });
  }
}
