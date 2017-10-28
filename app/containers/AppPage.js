import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import App from '../components/layout/App';
import * as WorkspaceActions from '../actions/WorkspaceAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('App Page');

function mapStateToProps(state) {
  logger.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  logger.log('mapDispatchToProps');
  return bindActionCreators(WorkspaceActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
