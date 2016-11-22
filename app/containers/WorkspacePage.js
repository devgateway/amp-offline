// @flow
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Workspace from '../components/workspace/Workspace';
import * as WorkspaceActions from '../actions/workspace';

function mapStateToProps(state) {
  console.log('mapStateToProps');
  // Add here everything the React component needs so it remains unaware of the implementation.
  const newState = Object.assign({}, state, {

  });
  return newState;
}

function mapDispatchToProps(dispatch, ownProps) {
  console.log('mapDispatchToProps');
  return bindActionCreators(WorkspaceActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
