import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import login from './LoginReducer';
import workspace from './WorkspaceReducer';
import translation from './TranslationReducer';
import syncUp from './SyncUpReducer';
import user from './UserReducer';
import desktop from './DesktopReducer';
import activityReducer from './ActivityReducer';
import ampConnectionStatus from './AmpConnectionStatusReducer';
import startUp from './StartUpReducer';

const rootReducer = combineReducers({
  login,
  workspace,
  routing,
  translation,
  syncUp,
  user,
  desktop,
  activityReducer,
  ampConnectionStatus,
  startUp
});

export default rootReducer;
