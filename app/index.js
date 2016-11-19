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

const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

function checkAuth(nextState, replaceState) {
  console.log('index/index.js - checkAuth');
  let {loggedIn} = store.getState();

  if (!loggedIn) {
    replaceState({nextPathname: nextState.location.pathname}, '/')
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
