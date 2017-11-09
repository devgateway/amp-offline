import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Login from '../components/login/Login';
import * as LoginActions from '../actions/LoginAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Login page');

function mapStateToProps(state) {
  logger.log('mapStateToProps');
  return {
    ...state,
    isSetupComplete: state.setupReducer.isSetupComplete
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  logger.log('mapDispatchToProps');
  return bindActionCreators(LoginActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
