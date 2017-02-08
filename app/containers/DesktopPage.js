// @flow
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Desktop from "../components/desktop/Desktop";
import * as DesktopActions from "../actions/DesktopAction";

function mapStateToProps(state) {
  console.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  console.log('mapDispatchToProps');
  return bindActionCreators(DesktopActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Desktop);
