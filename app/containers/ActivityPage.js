import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActivityPreview from '../components/activity/preview/ActivityPreview';
import * as ActivityAction from '../actions/ActivityAction';
import LoggerManager from '../modules/util/LoggerManager';

const mapStateToProps = (state) => {
  LoggerManager.log('mapStateToProps');
  return state;
};

function mapDispatchToProps(dispatch, ownProps) {
  LoggerManager.log('mapDispatchToProps');
  return bindActionCreators(ActivityAction, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityPreview);
