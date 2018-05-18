import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AFSection from './AFSection';
import { CONTACTS } from './AFSectionConstants';
import { ACTIVITY_CONTACT_PATHS } from '../../../../utils/constants/FieldPathConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';
import AFContactList from './contact/AFContactList';
import { getActivityContacts } from '../../../../actions/ContactAction';
import AFField from '../components/AFField';
import ActivityValidator from '../../../../modules/field/EntityValidator';
import ErrorMessage from '../../../common/ErrorMessage';


/**
 * AF Contacts Section
 *
 * @author Nadejda Mandrescu
 */
class AFContacts extends Component {
  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired,
    activity: PropTypes.object.isRequired,
    isSaveAndSubmit: PropTypes.bool.isRequired,
  };

  static childContextTypes = {
    contactReducer: PropTypes.object,
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(ActivityValidator),
    isSaveAndSubmit: PropTypes.bool,
    filterForUnhydratedByIds: PropTypes.func.isRequired,
    updateContact: PropTypes.func.isRequired,
  };

  static propTypes = {
    contactReducer: PropTypes.object.isRequired,
    loadSummaryForNotLoadedContacts: PropTypes.func.isRequired,
    loadHydratedContacts: PropTypes.func.isRequired,
    filterForUnhydratedByIds: PropTypes.func.isRequired,
    configureContactManagers: PropTypes.func.isRequired,
    updateContact: PropTypes.func.isRequired,
  };

  getChildContext() {
    return {
      activity: this.context.activity,
      activityFieldsManager: this.context.activityFieldsManager,
      activityValidator: this.context.activityValidator,
      isSaveAndSubmit: this.context.isSaveAndSubmit,
      contactReducer: this.props.contactReducer,
      filterForUnhydratedByIds: this.props.filterForUnhydratedByIds,
      updateContact: this.props.updateContact,
    };
  }

  componentWillMount() {
    this.props.loadSummaryForNotLoadedContacts();
    this.props.configureContactManagers();
  }

  componentWillReceiveProps(nextProps) {
    const { isContactsLoaded } = nextProps.contactReducer;
    if (isContactsLoaded) {
      const contactIds = getActivityContacts(this.context.activity);
      const unhydratedIds = nextProps.filterForUnhydratedByIds(contactIds);
      if (unhydratedIds.length) {
        this.props.loadHydratedContacts(unhydratedIds);
      }
    }
  }

  render() {
    const { contactsError } = this.props.contactReducer;
    if (contactsError) {
      return <ErrorMessage message={contactsError} />;
    }
    const extraParams = {
      listType: AFContactList
    };
    const contactGroups = ACTIVITY_CONTACT_PATHS
      .filter(acp => this.context.activityFieldsManager.isFieldPathEnabled(acp))
      // .slice(0, 1) // TODO remove
      .map(acp => <AFField key={acp} parent={this.context.activity} fieldPath={acp} extraParams={extraParams} />);
    return <div>{contactGroups}</div>;
  }

}

export default AFSection(AFContacts, CONTACTS);
