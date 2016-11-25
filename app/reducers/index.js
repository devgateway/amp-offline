// @flow
import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import login from './LoginReducer';
import workspace from './WorkspaceReducer';

const rootReducer = combineReducers({
  login,
  workspace,
  routing,
});

export default rootReducer;
