import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SyncUp from '../components/syncUp/SyncUp';
import * as SyncUpActions from '../actions/SyncUpAction';
import LoggerManager from '../modules/util/LoggerManager';

function mapStateToProps(state) {
  LoggerManager.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  LoggerManager.log('mapDispatchToProps');
  return bindActionCreators(SyncUpActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(SyncUp);
