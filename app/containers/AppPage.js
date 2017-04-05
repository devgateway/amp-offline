import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import App from '../components/layout/App';
import * as WorkspaceActions from '../actions/WorkspaceAction';
import LoggerManager from '../modules/util/LoggerManager';

function mapStateToProps(state) {
  LoggerManager.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  LoggerManager.log('mapDispatchToProps');
  return bindActionCreators(WorkspaceActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
