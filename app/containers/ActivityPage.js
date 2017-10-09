import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActivityPreview from '../components/activity/preview/ActivityPreview';
import ActivityForm from '../components/activity/edit/ActivityForm';
import * as ActivityAction from '../actions/ActivityAction';
import LoggerManager from '../modules/util/LoggerManager';

const mapStateToProps = (state) => {
  LoggerManager.log('mapStateToProps');
  return {
    activityReducer: state.activityReducer,
    userReducer: state.userReducer,
    workspaceReducer: state.workspaceReducer
  };
};

function mapDispatchToProps(dispatch, ownProps) {
  LoggerManager.log('mapDispatchToProps');
  return bindActionCreators(ActivityAction, dispatch, ownProps);
}

export const ActivityPreviewPage = connect(mapStateToProps, mapDispatchToProps)(ActivityPreview);
export const ActivityFormPage = connect(mapStateToProps, mapDispatchToProps)(ActivityForm);
