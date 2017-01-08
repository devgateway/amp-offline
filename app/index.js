// @flow
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory, Route, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import './app.global.css';
import App from './containers/App';
import LoginPage from './containers/LoginPage';
import DesktopPage from './containers/DesktopPage'
import WorkspacePage from './containers/WorkspacePage';
import SyncUpPage from './containers/SyncUpPage';
import auth from './modules/security/Auth';
import i18next from 'i18next';
import XHR from 'i18next-xhr-backend';
import { ampStartUp } from './actions/StartUpAction';
export const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

function checkAuth(nextState, replaceState) {
  console.log('checkAuth');
  if (!auth.loggedIn()) {
    replaceState({nextPathname: nextState.location.pathname}, '/');
  }
}

//TODO: Make a Settings.js class for all settings.
const settingsFile = require('./conf/settings.json');
// Initialize translations module.
const i18nOptions = settingsFile.I18N.OPTIONS.development;
i18next.use(XHR).init(i18nOptions, (err, t) => {
  if (err) {
    console.error(err);
  }

  ampStartUp().then(() => {
    render(
      <Provider store={store}>
        <Router history={history} store={store}>
          <Route path="/" component={App}>
            <IndexRoute component={LoginPage} dispatch={store.dispatch}/>
            <Route path="/workspace" component={WorkspacePage} onEnter={checkAuth} store={store}/>
            <Route path="/syncUp" component={SyncUpPage} onEnter={checkAuth}/>
            <Route path="/desktop/:teamId" component={DesktopPage} onEnter={checkAuth}/>
          </Route>
        </Router>
      </Provider>,
      document.getElementById('root')
    );
  });
});
