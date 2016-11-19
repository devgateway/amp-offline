// @flow
import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Router, hashHistory, Route, IndexRoute} from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux';
import configureStore from './store/configureStore';
import './app.global.css';
import App from './containers/App';
import LoginPage from './containers/LoginPage';
import WorkspacePage from './containers/WorkspacePage';
import auth from './modules/security/Auth'

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

auth.logout();

function checkAuth(nextState, replaceState) {
  console.log('index/index.js - checkAuth');

  if (!auth.loggedIn()) {
    replaceState({nextPathname: nextState.location.pathname}, '/');
  } else {
    replaceState(null, '/workspace');
  }
}

render(
  <Provider store={store}>
    <Router history={history} store={store}>
      <Route path="/" component={App}>
        <IndexRoute component={LoginPage}/>
        <Route path="/workspace" component={WorkspacePage} onEnter={checkAuth}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);
