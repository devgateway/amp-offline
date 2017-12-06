import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Desktop from '../components/desktop/Desktop';
import * as DesktopActions from '../actions/DesktopAction';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('Desktop page');

function mapStateToProps(state) {
  logger.log('mapStateToProps');
  return state;
}

function mapDispatchToProps(dispatch, ownProps) {
  logger.log('mapDispatchToProps');
  return bindActionCreators(DesktopActions, dispatch, ownProps);
}

export default connect(mapStateToProps, mapDispatchToProps)(Desktop);
