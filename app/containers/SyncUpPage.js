// @flow
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import SyncUp from '../components/syncUp/SyncUp';
import * as SyncUpActions from '../actions/SyncUpAction';

function mapStateToProps(state) {
  console.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  console.log('mapDispatchToProps');
  return bindActionCreators(SyncUpActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(SyncUp);
