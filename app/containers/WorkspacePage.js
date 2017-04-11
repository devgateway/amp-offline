import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Workspace from '../components/workspace/Workspace';
import * as WorkspaceActions from '../actions/WorkspaceAction';
import LoggerManager from '../modules/util/LoggerManager';

function mapStateToProps(state) {
  LoggerManager.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch) {
  // For better undestanding of this section:
  // https://github.com/reactjs/react-redux/blob/master/docs/api.md
  // #connectmapstatetoprops-mapdispatchtoprops-mergeprops-options
  LoggerManager.log('mapDispatchToProps');
  return bindActionCreators(WorkspaceActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
