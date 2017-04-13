import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory, Route, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import './app.global.css';
import AppPage from './containers/AppPage';
import LoginPage from './containers/LoginPage';
import DesktopPage from './containers/DesktopPage';
import ActivityPage from './containers/ActivityPage';
import WorkspacePage from './containers/WorkspacePage';
import SyncUpPage from './containers/SyncUpPage';
import auth from './modules/security/Auth';
import { ampStartUp } from './actions/StartUpAction';
import { loadAllLanguages } from './actions/TranslationAction';
import { initializeI18Next, initializeLanguageDirectory } from './modules/util/TranslationManager';
import LoggerManager from './modules/util/LoggerManager';

LoggerManager.log('index');
const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);
export default store;

function checkAuth(nextState, replaceState) {
  LoggerManager.log('checkAuth');
  if (!auth.loggedIn()) {
    replaceState({ nextPathname: nextState.location.pathname }, '/');
  }
}
initializeLanguageDirectory();

initializeI18Next().then(() => {
  store.dispatch(loadAllLanguages());
  return ampStartUp().then(() =>
    render(
      <Provider store={store}>
        <Router history={history} store={store}>
          <Route path="/" component={AppPage}>
            <IndexRoute component={LoginPage} dispatch={store.dispatch} />
            <Route path="/workspace" component={WorkspacePage} onEnter={checkAuth} store={store} />
            <Route path="/syncUp" component={SyncUpPage} onEnter={checkAuth} />
            <Route path="/desktop/:teamId" component={DesktopPage} onEnter={checkAuth} store={store} />
            <Route path="/desktop/current" component={DesktopPage} onEnter={checkAuth} store={store} />
            <Route
              path="/activity/preview/:activityId" component={ActivityPage} onEnter={checkAuth} store={store}
            />
          </Route>
        </Router>
      </Provider>,
      document.getElementById('root')
    )
  ).catch((err) => (LoggerManager.error(err)));
}).catch((err) => (LoggerManager.error(err)));
