import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ContactAction from '../actions/ContactAction';
import Logger from '../modules/util/LoggerManager';
import ContactView from '../components/contact/view/ContactView';
import ContactForm from '../components/contact/edit/ContactForm';

const logger = new Logger('Activity page');

const mapStateToProps = (state) => {
  logger.debug('mapStateToProps');
  // TODO update
  return {
    activityReducer: state.activityReducer,
    userReducer: state.userReducer,
    workspaceReducer: state.workspaceReducer
  };
};

function mapDispatchToProps(dispatch, ownProps) {
  logger.debug('mapDispatchToProps');
  return bindActionCreators(ContactAction, dispatch, ownProps);
}

export const ContactViewPage = connect(mapStateToProps, mapDispatchToProps)(ContactView);
export const ContactFormPage = connect(mapStateToProps, mapDispatchToProps)(ContactForm);
