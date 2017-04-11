import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Login from '../components/login/Login';
import * as LoginActions from '../actions/LoginAction';
import LoggerManager from '../modules/util/LoggerManager';

function mapStateToProps(state) {
  LoggerManager.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  LoggerManager.log('mapDispatchToProps');
  return bindActionCreators(LoginActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
