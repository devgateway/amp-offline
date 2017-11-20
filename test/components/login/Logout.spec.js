/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { spy } from 'sinon';
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import Logout from '../../../app/components/login/Logout';
import translate from '../../../app/utils/translate';
import configureStore from '../../../app/store/configureStore';

function setup(loggedIn) {
  const actions = {
    onClickLogout: spy()
  };
  const store = configureStore(loggedIn);
  const app = mount(
    <Provider store={store}>
      <Logout loggedIn={loggedIn} />
    </Provider>
  );
  return {
    actions,
    link: app.find('a')
  };
}


describe('@@ Logout.jsx @@', () => {
  it('should display Logout link', () => {
    const { link } = setup(true);
    expect(link.text()).to.be.equal(`${translate('logout')} | `);
  });

  it('should not display Logout link', () => {
    const { link } = setup(false);
    expect(link.length).to.be.equal(0);
  });
});
