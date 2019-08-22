import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActivityPreview from '../components/activity/preview/ActivityPreview';
import ActivityForm from '../components/activity/edit/ActivityForm';
import * as ActivityAction from '../actions/ActivityAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Activity page');

const mapStateToProps = (state) => {
  logger.log('mapStateToProps');
  return {
    activityReducer: state.activityReducer,
    contactReducer: state.contactReducer,
    resourceReducer: state.resourceReducer,
    userReducer: state.userReducer,
    workspaceReducer: state.workspaceReducer,
    startUpReducer: state.startUpReducer
  };
};

function mapDispatchToProps(dispatch, ownProps) {
  logger.log('mapDispatchToProps');
  return bindActionCreators(ActivityAction, dispatch, ownProps);
}

export const ActivityPreviewPage = connect(mapStateToProps, mapDispatchToProps)(ActivityPreview);
export const ActivityFormPage = connect(mapStateToProps, mapDispatchToProps)(ActivityForm);
