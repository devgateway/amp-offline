/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldPathConstants } from 'amp-ui';
import AFSection from './AFSection';
import { CONTACTS } from './AFSectionConstants';
import FieldsManager from '../../../../modules/field/FieldsManager';
import AFContactList from './contact/AFContactList';
import { getActivityContactIds } from '../../../../actions/ContactAction';
import AFField from '../components/AFField';
import ActivityValidator from '../../../../modules/field/EntityValidator';
import ErrorMessage from '../../../common/ErrorMessage';
import * as styles from './contact/AFContactList.css';

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
  };

  static childContextTypes = {
    contactReducer: PropTypes.object,
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(ActivityValidator),
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
      contactReducer: this.props.contactReducer,
      filterForUnhydratedByIds: this.props.filterForUnhydratedByIds,
      updateContact: this.props.updateContact,
    };
  }

  componentWillMount() {
    const { activity } = this.context;
    this.setState({ activity });
    FieldPathConstants.ACTIVITY_CONTACT_PATHS.forEach(acp => {
      if (this.context.activityFieldsManager.isFieldPathEnabled(acp) && !activity[acp]) {
        activity[acp] = [];
      }
    });
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

  onChange(activityContactsField) {
    const uniqueAC = [];
    const ids = new Set();
    const { activity } = this.state;
    activity[activityContactsField].forEach(ac => {
      const id = ac[ActivityConstants.CONTACT].id;
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
    const contactGroups = FieldPathConstants.ACTIVITY_CONTACT_PATHS
      .filter(acp => this.context.activityFieldsManager.isFieldPathEnabled(acp))
      .map(acp => (
        <div key={acp}>
          <AFField
            parent={this.context.activity} fieldPath={acp} extraParams={extraParams} className={styles.subSection}
            onAfterUpdate={this.onChange.bind(this, acp)} />
        </div>
      ));
    return <div>{contactGroups}</div>;
  }

}

export default AFSection(AFContacts, CONTACTS);
