import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { hashHistory, IndexRoute, Route, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import './app.global.css';
import Sanity from './components/setup/Sanity';
import AppPage from './containers/AppPage';
import LoginPage from './containers/LoginPage';
import DesktopPage from './containers/DesktopPage';
import { ActivityFormPage, ActivityPreviewPage } from './containers/ActivityPage';
import WorkspacePage from './containers/WorkspacePage';
import SyncUpPage from './components/syncUp/SyncUp';
import SyncUpSummaryPage from './containers/SyncUpSummaryPage';
import UpdatePage from './containers/UpdatePage';
import SettingPage from './containers/SettingPage';
import auth from './modules/security/Auth';
import { ampOfflineStartUp } from './actions/StartUpAction';
import { isForceSyncUp } from './actions/SyncUpAction';
import Logger from './modules/util/LoggerManager';
import { LOGIN_URL, SYNCUP_SUMMARY_URL, SYNCUP_REDIRECT_URL } from './utils/Constants';
import SetupPage from './containers/SetupPage';
import NotificationHelper from './modules/helpers/NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE, NOTIFICATION_SEVERITY_ERROR } from './utils/constants/ErrorConstants';
import { doSanityCheck } from './actions/SanityCheckAction';
import * as URLUtils from './utils/URLUtils';

const logger = new Logger('index');

logger.log('index');
const store = configureStore();
export const history = syncHistoryWithStore(hashHistory, store);
export default store;

const ignoreForceSyncUpFor = [LOGIN_URL, SYNCUP_REDIRECT_URL];

function checkAuth(nextState, replace) {
  logger.log('checkAuth');
  const nextPath = nextState.location.pathname;
  if (!auth.loggedIn()) {
    replace({ state: { nextPathname: nextPath }, pathname: '/' });
  } else if (!(ignoreForceSyncUpFor.includes(nextPath) || nextPath.startsWith(SYNCUP_SUMMARY_URL)) && isForceSyncUp()) {
    replace({ state: { nextPathname: nextPath }, pathname: SYNCUP_REDIRECT_URL });
  }
}

function handleUnexpectedError(err) {
  logger.error(err);
  const msg = 'An unexpected error occurred. Please collect logs, note your actions and contact the administrator.';
  const toString = err.toString();
  const json = JSON.stringify(err);
  alert(`${msg}\n\nDetails:\n${toString}\n\n${json}`);
}

const normalStartup = () => ampOfflineStartUp().then(() =>
  render(
    <Provider store={store}>
      <Router history={history} store={store}>
        <Route path="/" component={AppPage}>
          <IndexRoute component={LoginPage} dispatch={store.dispatch} />
          <Route path="/setup" component={SetupPage} store={store} />
          <Route path="/workspace" component={WorkspacePage} onEnter={checkAuth} store={store} />
          <Route path="/syncUp/:target" component={SyncUpPage} onEnter={checkAuth} store={store} />
          <Route path="/syncUpSummary/:id" component={SyncUpSummaryPage} onEnter={checkAuth} />
          <Route path="/syncUpSummary" component={SyncUpSummaryPage} onEnter={checkAuth} />
          <Route path="/desktop/:teamId" component={DesktopPage} onEnter={checkAuth} store={store} />
          <Route path="/desktop/current" component={DesktopPage} onEnter={checkAuth} store={store} />
          <Route
            path="/activity/preview/:activityId" component={ActivityPreviewPage} onEnter={checkAuth} store={store} />
          <Route
            path="/activity/edit/:activityId" component={ActivityFormPage} onEnter={checkAuth} store={store} />
          <Route path="/update" component={UpdatePage} store={store} />
          <Route path="/settings" component={SettingPage} store={store} />
        </Route>
      </Router>
    </Provider>,
    document.getElementById('root')
  )
).catch(handleUnexpectedError);

const sanityApp = () => doSanityCheck().then(() =>
  render(
    <Provider store={store}>
      <Router history={history} store={store}>
        <Route path="/" component={Sanity} />
      </Router>
    </Provider>,
    document.getElementById('root')
  )
).catch(handleUnexpectedError);

const params = URLUtils.parseQuery(window.location.search);
if (params.sanity === 'true') {
  logger.log('Starting sanity check app');
  sanityApp();
} else {
  logger.log('Starting the main app');
  document.getElementById('root').className = 'outerContainer';
  normalStartup();
}

window.addEventListener('error', ({ filename, message }) => {
  handleUnexpectedError(`Uncaught error: ${message} IN ${filename}`);
});

window.addEventListener('unhandledrejection', ({ reason }) => {
  logger.warn('Unhandled promise rejection:', reason);
  if (reason instanceof NotificationHelper) {
    const notification = reason;
    const { severity, origin } = notification;
    if (severity === NOTIFICATION_SEVERITY_ERROR && origin === NOTIFICATION_ORIGIN_DATABASE) {
      handleUnexpectedError(notification.message);
    }
  }
});
