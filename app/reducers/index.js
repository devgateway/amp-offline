// @flow
import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import login from './LoginReducer';
import workspace from './WorkspaceReducer';
import translation from './TranslationReducer';

const rootReducer = combineReducers({
  login,
  workspace,
  routing,
  translation
});

export default rootReducer;
