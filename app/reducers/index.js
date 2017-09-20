import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import loginReducer from './LoginReducer';
import workspaceReducer from './WorkspaceReducer';
import translationReducer from './TranslationReducer';
import syncUpReducer from './SyncUpReducer';
import userReducer from './UserReducer';
import desktopReducer from './DesktopReducer';
import activityReducer from './ActivityReducer';
import ampConnectionStatusReducer from './AmpConnectionStatusReducer';
import startUpReducer from './StartUpReducer';
import notificationReducer from './NotificationReducer';
import currencyRatesReducer from './CurrencyRatesReducer';
import updateReducer from './UpdateReducer';
import { STATE_LOGOUT } from '../actions/LoginAction';

const combinedReducers = combineReducers({
  loginReducer,
  workspaceReducer,
  routing,
  translationReducer,
  syncUpReducer,
  userReducer,
  desktopReducer,
  activityReducer,
  ampConnectionStatusReducer,
  startUpReducer,
  notificationReducer,
  currencyRatesReducer,
  updateReducer
});

const rootReducer = (state, action) => {
  if (action.type === STATE_LOGOUT) {
    state = undefined;
  }
  return combinedReducers(state, action);
};

export default rootReducer;
