// @flow
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import App from '../components/layout/App';
import * as WorkspaceActions from '../actions/WorkspaceAction';

function mapStateToProps(state) {
  console.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  console.log('mapDispatchToProps');
  return bindActionCreators(WorkspaceActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
