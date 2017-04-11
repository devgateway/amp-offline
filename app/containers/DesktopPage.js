import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Desktop from '../components/desktop/Desktop';
import * as DesktopActions from '../actions/DesktopAction';
import LoggerManager from '../modules/util/LoggerManager';

function mapStateToProps(state) {
  LoggerManager.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  LoggerManager.log('mapDispatchToProps');
  return bindActionCreators(DesktopActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Desktop);
