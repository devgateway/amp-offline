import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { hashHistory, IndexRoute, Route, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import './app.global.css';
import AppPage from './containers/AppPage';
import LoginPage from './containers/LoginPage';
import DesktopPage from './containers/DesktopPage';
import { ActivityFormPage, ActivityPreviewPage } from './containers/ActivityPage';
import WorkspacePage from './containers/WorkspacePage';
import SyncUpPage from './components/syncUp/SyncUp';
import SyncUpSummaryPage from './containers/SyncUpSummaryPage';
import UpdatePage from './containers/UpdatePage';
import auth from './modules/security/Auth';
import { ampOfflineStartUp } from './actions/StartUpAction';
import { isForceSyncUp } from './actions/SyncUpAction';
import LoggerManager from './modules/util/LoggerManager';
import { LOGIN_URL, SYNCUP_SUMMARY, SYNCUP_URL } from './utils/Constants';
import SetupPage from './containers/SetupPage';

LoggerManager.log('index');
const store = configureStore();
export const history = syncHistoryWithStore(hashHistory, store);
export default store;

const ignoreForceSyncUpFor = [LOGIN_URL, SYNCUP_URL];

function checkAuth(nextState, replaceState) {
  LoggerManager.log('checkAuth');
  const nextPath = nextState.location.pathname;
  if (!auth.loggedIn()) {
    replaceState({ nextPathname: nextState.location.pathname }, '/');
  } else if (!ignoreForceSyncUpFor.includes(nextPath) && !nextPath.startsWith(SYNCUP_SUMMARY) && isForceSyncUp()) {
    LoggerManager.warn('Redirecting to sync up page');
    replaceState({ nextPathname: nextState.location.pathname }, SYNCUP_URL);
  }
}

ampOfflineStartUp().then(() =>
  render(
    <Provider store={store}>
      <Router history={history} store={store}>
        <Route path="/" component={AppPage}>
          <IndexRoute component={LoginPage} dispatch={store.dispatch} />
          <Route path="/setup" component={SetupPage} store={store} />
          <Route path="/workspace" component={WorkspacePage} onEnter={checkAuth} store={store} />
          <Route path="/syncUp" component={SyncUpPage} onEnter={checkAuth} store={store} />
          <Route path="/syncUpSummary/:id" component={SyncUpSummaryPage} onEnter={checkAuth} />
          <Route path="/syncUpSummary" component={SyncUpSummaryPage} onEnter={checkAuth} />
          <Route path="/desktop/:teamId" component={DesktopPage} onEnter={checkAuth} store={store} />
          <Route path="/desktop/current" component={DesktopPage} onEnter={checkAuth} store={store} />
          <Route
            path="/activity/preview/:activityId" component={ActivityPreviewPage} onEnter={checkAuth} store={store} />
          <Route
            path="/activity/edit/:activityId" component={ActivityFormPage} onEnter={checkAuth} store={store} />
          <Route path="/update" component={UpdatePage} store={store} />
        </Route>
      </Router>
    </Provider>,
    document.getElementById('root')
  )
).catch((err) => (LoggerManager.error(err)));
