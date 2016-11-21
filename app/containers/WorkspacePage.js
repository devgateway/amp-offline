// @flow
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Workspace from '../components/workspace/Workspace';
import * as WorkspaceActions from '../actions/workspace';

function mapStateToProps(state) {
  console.log('containers/workspacePage.js - mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  console.log('containers/workspacePage.js - mapDispatchToProps');
  return bindActionCreators(WorkspaceActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
