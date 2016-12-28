/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {spy} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
// Note the curly braces: grab the named export instead of default export
import {TopMenu} from '../../../app/components/layout/TopMenu.jsx';
import * as MenuUtils from '../../../app/utils/MenuUtils';
import Menu, {SubMenu, Item as MenuItem, Divider} from 'rc-menu';

function setup() {
  const menu = {
    "menu": {
      "OPTION1": {
        "route": null,
        "public": false,
        "nodes": {
          "option11": {
            "route": "/test11",
            "params": null
          },
          "option12": {
            "route": "/test12"
          }
        }
      }
    }
  };
  const loggedUser = true;
  const component = shallow(<TopMenu builder={MenuUtils.default.prototype.buildMenu}
                                     onClick={MenuUtils.handleClick}
                                     loggedIn={loggedUser} menu={menu}/>);
  console.log('html completo');
  console.log(component.html());
  console.log('debug completo');
  console.log(component.debug());
  console.log('html 2do render');
  console.log(component.find(SubMenu).render());
  console.log(component.render().find('.rc-menu-item').first().text());
  return {
    component,
    loggedUser: loggedUser,
    trnPrefix: 'menu.',
    menu: component.render().find('.rc-menu').find('div'),
    firstLevelOption: component.render().find('.rc-menu-submenu-title'),
    secondLevelOption: component.render().find('.rc-menu-item')
  };
}

// http://redux.js.org/docs/recipes/WritingTests.html
describe('@@ TopMenu @@', () => {
  it('Should render the menu', () => {
    const {menu, trnPrefix} = setup();
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    console.log('1' + menu.html() + '1');
    expect(menu.html()).to.equal(trnPrefix + 'OPTION1');
  });

  it('Should render a 1st level options', () => {
    const {firstLevelOption, trnPrefix} = setup();
    console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    console.log('2' + firstLevelOption.html() + '2');
    expect(firstLevelOption.html()).to.equal(trnPrefix + 'OPTION1');
  });

  it('Should render a menu item', () => {
    const {secondLevelOption, trnPrefix} = setup();
    console.log('cccccccccccccccccccccccccccc');
    console.log('3' + secondLevelOption.html() + '3');
    expect(secondLevelOption.html()).to.equal(trnPrefix + 'option11');
  });
});
