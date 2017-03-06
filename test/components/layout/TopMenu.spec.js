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
  //console.log(component.debug());
  return {
    component,
    menuJson: menuJson,
    loggedUser: loggedUser,
    menu: component.render().find('.rc-menu').find('div'),
    firstLevelOption: component.render().find('.rc-menu-submenu-title'),
    topMenuComponent: topMenuComponent
  };
}

// http://redux.js.org/docs/recipes/WritingTests.html
describe('@@ TopMenu @@', () => {
  it('Should render the menu', () => {
    const {topMenuComponent} = setup();
    const renderTopMenuComponent = TestUtils.renderIntoDocument(topMenuComponent);
    const numberOfMenus = TestUtils.scryRenderedComponentsWithType(renderTopMenuComponent, Menu).length;
    expect(numberOfMenus).to.equal(1);
  });

  it('Should render the menu title', () => {
    const {menu} = setup();
    expect(menu.html()).to.equal('OPTION1');
  });

  it('Should render 1st level option', () => {
    const {topMenuComponent} = setup();
    const renderTopMenuComponent = TestUtils.renderIntoDocument(topMenuComponent);
    const numberOfSubMenus = TestUtils.scryRenderedComponentsWithType(renderTopMenuComponent, SubMenu).length;
    expect(numberOfSubMenus).to.equal(1);
  });

  it('Should render a 1st level option title', () => {
    const {firstLevelOption} = setup();
    expect(firstLevelOption.html()).to.equal('OPTION1');
  });

  it('Should render 2rd level options', () => {
    // This test is different to detect the rendering of MenuItems.
    const {component} = setup();
    expect(component.debug().toString().indexOf('option12')).to.not.equal(-1);
    expect(component.debug().toString().indexOf('option11')).to.not.equal(-1);
  });
});
