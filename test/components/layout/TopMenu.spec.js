/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {spy} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
// Note the curly braces: grab the named export instead of default export
import {TopMenu} from '../../../app/components/layout/TopMenu.jsx';
import * as MenuUtils from '../../../app/utils/MenuUtils';
import Menu, {SubMenu, MenuItem} from 'rc-menu';
import TestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server'
import {mount} from 'enzyme';

function setup() {
  const menuJson = {
    "menu": {
      "OPTION1": {
        "route": null,
        "public": false,
        "nodes": {
          "option11": {
            "public": false,
            "route": "/test11",
            "params": null
          },
          "option12": {
            "public": false,
            "route": "/test12"
          }
        }
      }
    }
  };
  const loggedUser = true;
  const topMenuComponent = <TopMenu builder={MenuUtils.default.prototype.buildMenu}
                                    onClick={MenuUtils.handleClick}
                                    loggedIn={loggedUser} menu={menuJson}/>;
  const component = shallow(topMenuComponent);
  console.log('html completo');
  console.log(component.html());
  console.log('debug completo');
  console.log(component.debug());
  console.log(component.render().find('.rc-menu-item').first().text());
  return {
    component,
    menuJson: menuJson,
    loggedUser: loggedUser,
    trnPrefix: 'menu.',
    menu: component.render().find('.rc-menu').find('div'),
    firstLevelOption: component.render().find('.rc-menu-submenu-title'),
    secondLevelOption: component.render().find('.rc-menu-item'),
    topMenuComponent: topMenuComponent
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

  it('Should render 2st level options', () => {
    const {trnPrefix, menuJson, loggedUser, topMenuComponent} = setup();
    console.log('ccccccccccccccccccccccccccccccc');
    const renderTopMenuComponent = TestUtils.renderIntoDocument(topMenuComponent);
    const numberOfSubMenus = TestUtils.scryRenderedComponentsWithType(renderTopMenuComponent, SubMenu).length;
    expect(numberOfSubMenus).to.equal(1);
  });

  it('Should render 3rd level options', () => {
    // This test is different to detect the rendering of MenuItems.
    const {trnPrefix, component} = setup();
    console.log('ddddddddddddddddddddddddddd');
    expect(component.debug().toString().indexOf(trnPrefix + 'option12')).to.not.equal(-1);
    expect(component.debug().toString().indexOf(trnPrefix + 'option11')).to.not.equal(-1);
  });
});
