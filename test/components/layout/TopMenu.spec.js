/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {spy} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import TopMenu from '../../../app/components/layout/TopMenu.jsx';
import * as MenuUtils from '../../../app/utils/MenuUtils';

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
  const loggedUser = {loggedIn: true};
  const component = shallow(<TopMenu builder={MenuUtils.default.prototype.buildMenu} onClick={MenuUtils.handleClick}
                                     user={user}/>);
  return {
    component,
    loggedUser,
    menu: component.find('rc-menu')
  };
}


describe('@@ TopMenu @@', () => {
  it('Should render the menu', () => {
    const {menu, props} = setup();
    expect(spans.at(0).text()).to.equal(translate(props.text));
  });
});
