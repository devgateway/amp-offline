// @flow
import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import login from './LoginReducer';
import workspace from './WorkspaceReducer';
import translation from './TranslationReducer';
import syncUp from './SyncUpReducer';
import user from './UserReducer';
import desktop from './DesktopReducer'
import ampConnectionStatus from './AmpConnectionStatusReducer';
import startUp from './startUpReducer';

const rootReducer = combineReducers({
  login,
  workspace,
  routing,
  translation,
  syncUp,
  user,
  desktop,
  ampConnectionStatus,
  startUp
});

export default rootReducer;
