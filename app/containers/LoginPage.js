// @flow
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Login from '../components/login/Login';
import * as LoginActions from '../actions/login';

function mapStateToProps(state) {
  console.log('containers/loginPage.js - mapStateToProps');
  console.log(state);
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  console.log('containers/loginPage.js - mapDispatchToProps');
  console.log(dispatch);
  console.log(ownProps);
  return bindActionCreators(LoginActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
