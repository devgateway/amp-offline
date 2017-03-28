import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ActivityPreview from '../components/activity/preview/ActivityPreview';
import * as ActivityAction from '../actions/ActivityAction';

const mapStateToProps = (state) => {
  console.log('mapStateToProps');
  return state;
};

function mapDispatchToProps(dispatch, ownProps) {
  console.log('mapDispatchToProps');
  return bindActionCreators(ActivityAction, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityPreview);
