import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ContactAction from '../actions/ContactAction';
import Logger from '../modules/util/LoggerManager';
import ContactView from '../components/contact/view/ContactView';
import ContactForm from '../components/contact/edit/ContactForm';
import AFContacts from '../components/activity/edit/sections/AFContacts';

const logger = new Logger('Activity page');

const mapStateToProps = (state) => {
  logger.debug('mapStateToProps');
  return {
    contactReducer: state.contactReducer,
    teamMemberId: state.userReducer.teamMember.id,
    workspaceReducer: state.workspaceReducer
  };
};

function mapDispatchToProps(dispatch, ownProps) {
  logger.debug('mapDispatchToProps');
  return bindActionCreators(ContactAction, dispatch, ownProps);
}

export const ContactViewPage = connect(mapStateToProps, mapDispatchToProps)(ContactView);
export const ContactFormPage = connect(mapStateToProps, mapDispatchToProps)(ContactForm);
export const AFContactsPage = connect(mapStateToProps, mapDispatchToProps)(AFContacts);
