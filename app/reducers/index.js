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

const rootReducer = combineReducers({
  loginReducer,
  workspaceReducer,
  routing,
  translationReducer,
  syncUpReducer,
  userReducer,
  desktopReducer,
  activityReducer,
  ampConnectionStatusReducer,
  startUpReducer
});

export default rootReducer;
