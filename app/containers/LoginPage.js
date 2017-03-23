import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Login from '../components/login/Login';
import * as LoginActions from '../actions/LoginAction';

function mapStateToProps(state) {
  console.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  console.log('mapDispatchToProps');
  return bindActionCreators(LoginActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
