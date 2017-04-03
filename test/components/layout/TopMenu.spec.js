/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import Menu, { SubMenu } from 'rc-menu';
import TestUtils from 'react-addons-test-utils';
import React from 'react';
import { shallow } from 'enzyme';
import { describe, it } from 'mocha';
// Note the curly braces: grab the named export instead of default export
import { TopMenu } from '../../../app/components/layout/TopMenu';
import * as MenuUtils from '../../../app/utils/MenuUtils';
import store from '../../../app/index';

function setup() {
  const menuJson = {
    menu: {
      DESKTOP: {
        route: null,
        public: false,
        nodes: {
          'Change workspace': {
            public: false,
            route: '/test11',
            params: null
          },
          option12: {
            public: false,
            route: '/test12'
          }
        }
      },
      TOOLS: {
        route: null,
        public: true,
        nodes: {
          'Change Language': {
            public: true,
            nodes: {}
          }
        }
      }
    }
  };
  const loggedUser = true;
  const topMenuComponent = (<TopMenu
    builder={MenuUtils.default.prototype.buildMenu}
    onClick={MenuUtils.handleClick}
    loggedIn={loggedUser}
    menu={menuJson}
    workspaceList={store.getState().workspace.workspaceList}
    menuOnClickHandler={store.getState().menuOnClickHandler}
    languageList={store.getState().translation.languageList}
  />);
  const component = shallow(topMenuComponent);
  // console.log(component.debug());
  return {
    component,
    menuJson,
    loggedUser,
    menu: component.render().find('.rc-menu').find('div'),
    firstLevelOption: component.render().find('.rc-menu-submenu-title'),
    topMenuComponent
  };
}

// http://redux.js.org/docs/recipes/WritingTests.html
describe('@@ TopMenu @@', () => {
  it('should render the menu', () => {
    const { topMenuComponent } = setup();
    const renderTopMenuComponent = TestUtils.renderIntoDocument(topMenuComponent);
    const numberOfMenus = TestUtils.scryRenderedComponentsWithType(renderTopMenuComponent, Menu).length;
    expect(numberOfMenus).to.equal(1);
  });

  it('should render the menu title', () => {
    const { menu } = setup();
    expect(menu.html()).to.equal('DESKTOP');
  });

  it('should render 1st level option', () => {
    const { topMenuComponent } = setup();
    const renderTopMenuComponent = TestUtils.renderIntoDocument(topMenuComponent);
    const numberOfSubMenus = TestUtils.scryRenderedComponentsWithType(renderTopMenuComponent, SubMenu).length;
    expect(numberOfSubMenus).to.equal(2);
  });

  it('should render a 1st level option title', () => {
    const { firstLevelOption } = setup();
    expect(firstLevelOption.html()).to.equal('DESKTOP');
  });

  it('should render 2rd level options', () => {
    // This test is different to detect the rendering of MenuItems.
    const { component } = setup();
    expect(component.debug().toString().indexOf('option12')).to.not.equal(-1);
    expect(component.debug().toString().indexOf('Change workspace')).to.not.equal(-1);
  });
});
