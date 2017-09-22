import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Update from '../components/update/Update';
import * as UpdateAction from '../actions/UpdateAction';

function mapStateToProps({ updateReducer }, { params }) {
  return { ...updateReducer, ...params };
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators(UpdateAction, dispatch, ownProps);
}


export default connect(mapStateToProps, mapDispatchToProps)(Update);
