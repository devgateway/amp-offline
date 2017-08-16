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
import { ActivityPreviewPage, ActivityFormPage } from './containers/ActivityPage';
import WorkspacePage from './containers/WorkspacePage';
import SyncUpPage from './containers/SyncUpPage';
import SyncUpSummaryPage from './containers/SyncUpSummaryPage';
import auth from './modules/security/Auth';
import { ampStartUp } from './actions/StartUpAction';
import { initializeI18Next, initializeLanguageDirectory } from './modules/util/TranslationManager';
import LoggerManager from './modules/util/LoggerManager';

LoggerManager.log('index');
const store = configureStore();
export const history = syncHistoryWithStore(hashHistory, store);
export default store;

function checkAuth(nextState, replaceState) {
  LoggerManager.log('checkAuth');
  if (!auth.loggedIn()) {
    replaceState({ nextPathname: nextState.location.pathname }, '/');
  }
}
initializeLanguageDirectory();

initializeI18Next().then(() =>
  ampStartUp().then(() =>
    render(
      <Provider store={store}>
        <Router history={history} store={store}>
          <Route path="/" component={AppPage}>
            <IndexRoute component={LoginPage} dispatch={store.dispatch} />
            <Route path="/workspace" component={WorkspacePage} onEnter={checkAuth} store={store} />
            <Route path="/syncUp" component={SyncUpPage} onEnter={checkAuth} />
            <Route path="/syncUpSummary/:id" component={SyncUpSummaryPage} onEnter={checkAuth} />
            <Route path="/syncUpSummary" component={SyncUpSummaryPage} onEnter={checkAuth} />

            <Route path="/desktop/:teamId" component={DesktopPage} onEnter={checkAuth} store={store} />
            <Route path="/desktop/current" component={DesktopPage} onEnter={checkAuth} store={store} />
            <Route
              path="/activity/preview/:activityId" component={ActivityPreviewPage} onEnter={checkAuth} store={store} />
            <Route
              path="/activity/edit/:activityId" component={ActivityFormPage} onEnter={checkAuth} store={store} />
          </Route>
        </Router>
      </Provider>,
      document.getElementById('root')
    )
  ).catch((err) => (LoggerManager.error(err)))
).catch((err) => (LoggerManager.error(err)));
