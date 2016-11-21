// @flow
import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import login from './login';
import workspace from './workspace';

const rootReducer = combineReducers({
  login,
  workspace,
  routing,
});

export default rootReducer;
