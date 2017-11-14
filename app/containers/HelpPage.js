import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Help from '../components/help/Help';
import * as HelpAction from '../actions/HelpAction';

function mapStateToProps(state) {
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  return bindActionCreators(HelpAction, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Help);
