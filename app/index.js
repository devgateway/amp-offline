import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { hashHistory, IndexRoute, Route, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ipcRenderer } from 'electron';
import { Constants, ErrorConstants, ActivityLinks } from 'amp-ui';
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
import { ampOfflinePreStartUp, ampOfflineStartUp } from './actions/StartUpAction';
import { isForceSyncUp } from './actions/SyncUpAction';
import Logger from './modules/util/LoggerManager';
import SetupPage from './containers/SetupPage';
import NotificationHelper from './modules/helpers/NotificationHelper';
import { doSanityCheck } from './actions/SanityCheckAction';
import * as URLUtils from './utils/URLUtils';
import { INITIALIZATION_COMPLETE_MSG } from './utils/constants/MainDevelopmentConstants';
import * as ElectronApp from './modules/util/ElectronApp';
import translate from './utils/translate';

const logger = new Logger('index');

logger.log('index');
const store = configureStore();
export const history = syncHistoryWithStore(hashHistory, store);
export default store;

const ignoreForceSyncUpFor = [Constants.LOGIN_URL, Constants.SYNCUP_REDIRECT_URL];

function checkAuth(nextState, replace) {
  logger.log('checkAuth');
  const nextPath = nextState.location.pathname;
  if (!auth.loggedIn()) {
    replace({ state: { nextPathname: nextPath }, pathname: '/' });
  } else if (!(ignoreForceSyncUpFor.includes(nextPath) || nextPath.startsWith(Constants.SYNCUP_SUMMARY_URL)) &&
    isForceSyncUp()) {
    replace({ state: { nextPathname: nextPath }, pathname: Constants.SYNCUP_REDIRECT_URL });
  }
}

function handleUnexpectedError(err) {
  logger.error(err);
  const msg = translate('unexpectedError');
  const toString = err.toString();
  const json = JSON.stringify(err);
  // eslint-disable-next-line no-alert
  alert(`${msg}\n\nDetails:\n${toString}\n\n${json}`);
  // If this error occurs before we show the main window we need to close the app for the user.
  // For some reason after window becomes active and an error occurs, it still closes the app, which prevents from
  // getting the error from the console. => Do not close in dev mode (use CTRL^C if needed).
  if (!global.MAIN_WINDOW_ACTIVE && !ElectronApp.IS_DEV_MODE) {
    ElectronApp.forceCloseApp();
  }
}

function _registerActivityLinks() {
  const editLink = { isExternal: false, url: Constants.ACTIVITY_EDIT_URL };
  const viewLink = { isExternal: false, url: Constants.ACTIVITY_PREVIEW_URL };
  ActivityLinks.registerLinks({ editLink, viewLink });
}

const normalStartup = () => ampOfflinePreStartUp().then(result => {
  _registerActivityLinks();
  if (result !== true) {
    const msg = (result && (result.message || result)) || translate('unexpectedError');
    // at this point we cannot use our app specific notification system
    // Until AMPOFFLINE-253, it will be always in EN, like any other notifications shown before user can switch language
    // eslint-disable-next-line no-alert
    if (!confirm(msg)) {
      ElectronApp.forceCloseApp();
      return false;
    }
  }
  return ampOfflineStartUp().then(() => true);
})
  .then((isContinue) => {
    if (isContinue) {
      ipcRenderer.send(INITIALIZATION_COMPLETE_MSG);
      return render(
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
                path="/activity/preview/:activityId" component={ActivityPreviewPage} onEnter={checkAuth}
                store={store} />
              <Route
                path="/activity/edit/:activityId" component={ActivityFormPage} onEnter={checkAuth} store={store} />
              <Route path="/update" component={UpdatePage} store={store} />
              <Route path="/settings" component={SettingPage} store={store} />
            </Route>
          </Router>
        </Provider>,
        document.getElementById('root')
      );
    }
    return isContinue;
  }).catch(handleUnexpectedError);

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
  logger.error(message, filename);
  const trn = translate('uncaughtErrorInFile').replace('%message%', message).replace('%filename%', filename);
  handleUnexpectedError(trn);
});

window.addEventListener('unhandledrejection', (e) => {
  let { reason } = e;
  if (!reason) {
    if (e instanceof CustomEvent) {
      reason = e.detail && e.detail.reason;
    } else if (e instanceof NotificationHelper) {
      reason = e;
    } else {
      reason = e;
    }
  }
  logger.warn(`Unhandled promise rejection: ${reason}`);
  if (reason instanceof NotificationHelper) {
    const notification = reason;
    const { severity, origin } = notification;
    if (severity === ErrorConstants.NOTIFICATION_SEVERITY_ERROR &&
      origin === ErrorConstants.NOTIFICATION_ORIGIN_DATABASE) {
      handleUnexpectedError(notification.message);
    }
  }
});
