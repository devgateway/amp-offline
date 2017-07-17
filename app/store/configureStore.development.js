import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware, push } from 'react-router-redux';
import promiseMiddleware from 'redux-promise-middleware';
import createLogger from 'redux-logger';
import rootReducer from '../reducers';
import * as loginActions from '../actions/LoginAction';
import * as workspaceActions from '../actions/WorkspaceAction';
import * as connectivityActions from '../actions/ConnectivityAction';
import * as activityActions from '../actions/ActivityAction';
import * as syncUpActions from '../actions/SyncUpAction';
import * as desktopActions from '../actions/DesktopAction';
import * as translationActions from '../actions/TranslationAction';
import * as startUpActions from '../actions/StartUpAction';
import * as notificationActions from '../actions/NotificationAction';
import * as currencyRatesActions from '../actions/CurrencyRatesAction';

const actionCreators = {
  ...loginActions,
  ...workspaceActions,
  ...connectivityActions,
  ...activityActions,
  ...syncUpActions,
  ...desktopActions,
  ...translationActions,
  ...startUpActions,
  ...notificationActions,
  ...currencyRatesActions,
  push,
};

const logger = createLogger({
  level: 'info',
  collapsed: true
});

const router = routerMiddleware(hashHistory);

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
    actionCreators,
  }) :
  compose;
/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(
  applyMiddleware(promiseMiddleware(), thunk, router, logger)
);

export default function configureStore(initialState: Object) {
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')) // eslint-disable-line global-require
    );
  }

  return store;
}
