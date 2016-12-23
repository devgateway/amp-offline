// @flow
import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import login from './LoginReducer';
import workspace from './WorkspaceReducer';
import translation from './TranslationReducer';
import syncUp from './SyncUpReducer';
import user from './UserReducer';
import ampConnectionStatus from './AmpConnectionStatusReducer';

const rootReducer = combineReducers({
  login,
  workspace,
  routing,
  translation,
  syncUp,
  user,
  ampConnectionStatus,
});



export default rootReducer;
