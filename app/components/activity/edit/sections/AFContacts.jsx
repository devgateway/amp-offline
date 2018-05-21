/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AFSection from './AFSection';
import { CONTACTS } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import { ACTIVITY_CONTACT_PATHS } from '../../../../utils/constants/FieldPathConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';
import AFContactList from './contact/AFContactList';
import { buildNewActivityContact, getActivityContactIds } from '../../../../actions/ContactAction';
import AFField from '../components/AFField';
import ActivityValidator from '../../../../modules/field/EntityValidator';
import ErrorMessage from '../../../common/ErrorMessage';
import AFLabel from '../components/AFLabel';
import * as entryListStyles from '../../../common/edit/EntryList.css';


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
    this.setState({ activity: this.context.activity });
    this.props.loadSummaryForNotLoadedContacts();
  }

  componentWillReceiveProps(nextProps) {
    this.onUnhydratedCheck(nextProps);
  }

  onUnhydratedCheck(props) {
    const { isContactsLoaded } = props.contactReducer;
    if (isContactsLoaded) {
      const contactIds = getActivityContactIds(this.context.activity);
      const unhydratedIds = props.filterForUnhydratedByIds(contactIds);
      if (unhydratedIds.length) {
        this.props.loadHydratedContacts(unhydratedIds);
      }
    }
  }

  onAdd(activityContactsField) {
    const activityContact = buildNewActivityContact();
    this.context.activity[activityContactsField].push(activityContact);
    this.props.updateContact(activityContact[AC.CONTACT]);
  }

  onChange(activityContactsField) {
    const uniqueAC = [];
    const ids = new Set();
    const { activity } = this.state;
    activity[activityContactsField].forEach(ac => {
      const id = ac[AC.CONTACT].id;
      if (!ids.has(id)) {
        ids.add(id);
        uniqueAC.push(ac);
      }
    });
    if (activity[activityContactsField].length !== uniqueAC.length) {
      // replicate AMP behavior to keep unique contacts
      activity[activityContactsField] = uniqueAC;
      this.setState({ activity });
    }
    this.onUnhydratedCheck(this.props);
  }

  render() {
    const { contactsError } = this.props.contactReducer;
    if (contactsError) {
      return <ErrorMessage message={contactsError} />;
    }
    const extraParams = {
      listType: AFContactList
    };
    // TODO in a separate task we'll use translatable labels for contact group/list type
    const contactGroups = ACTIVITY_CONTACT_PATHS
      .filter(acp => this.context.activityFieldsManager.isFieldPathEnabled(acp))
      .map(acp => (
        <div key={acp}>
          <AFLabel value={acp} />
          <span className={entryListStyles.addButton}>
            <a onClick={this.onAdd.bind(this, acp)} href={null} />
          </span>
          <AFField
            parent={this.context.activity} showLabel={false} fieldPath={acp} extraParams={extraParams}
            onAfterUpdate={this.onChange.bind(this, acp)} />
        </div>
      ));
    return <div>{contactGroups}</div>;
  }

}

export default AFSection(AFContacts, CONTACTS);
