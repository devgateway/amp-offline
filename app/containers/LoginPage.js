// @flow
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Login from '../components/login/Login';
import * as LoginActions from '../actions/login';

function mapStateToProps(state) {
  return {
    loggedUser: state.loggedUser,
    test1: 0
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(LoginActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
