/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Tablify from '../components/Tablify';
import { ACTIVITY_CONTACT_PATHS } from '../../../../utils/constants/FieldPathConstants';
import { ACTIVITY_CONTACT_COLS, CONTACT } from '../../../../utils/constants/ActivityConstants';
import styles from '../ActivityPreview.css';
import FieldsManager from '../../../../modules/field/FieldsManager';
import { getActivityContactIds } from '../../../../actions/ContactAction';
import * as CC from '../../../../utils/constants/ContactConstants';
import translate from '../../../../utils/translate';
import APField from '../components/APField';

/**
 * Activity Preview Contact section
 *
 * @author Nadejda Mandrescu
 */
class APContact extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    contactFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    contactsByIds: PropTypes.object,
    buildSimpleField: PropTypes.func.isRequired,
  };

  getHydratedContacts() {
    const { activity, contactsByIds } = this.props;
    const contactIds = getActivityContactIds(activity);
    const hydratedContactsByIds = {};
    contactIds.forEach(cId => {
      const c = contactsByIds[cId] || {};
      if (c[CC.TMP_HYDRATED]) {
        hydratedContactsByIds[cId] = c;
      }
    });
    return hydratedContactsByIds;
  }

  renderContact(contact) {
    const { contactFieldsManager, buildSimpleField } = this.props;
    return (
      <div key={contact.id} className={styles.paddingBottomLarge}>
        <div>{`${contact[CC.NAME]} ${contact[CC.LAST_NAME]}`}</div>
        {contact[CC.EMAIL].map(email =>
          buildSimpleField(`${CC.EMAIL}~${CC.VALUE}`, true, null, false, email, contactFieldsManager))}
        {contact[CC.PHONE].map(phone =>
          buildSimpleField(`${CC.PHONE}~${CC.VALUE}`, true, null, false, phone, contactFieldsManager))}
      </div>
    );
  }

  renderNoContacts() {
    return (
      <APField
        fieldNameClass={styles.hidden} fieldValueClass={styles.nodata} fieldClass={styles.flex} separator={false}
        value={translate('No Data')} />
    );
  }

  render() {
    const { activity, activityFieldsManager } = this.props;
    const hydratedContactsByIds = this.getHydratedContacts();
    const contactGroups = ACTIVITY_CONTACT_PATHS
      .filter(acp => activityFieldsManager.isFieldPathEnabled(acp))
      .map(acp => {
        const title = activityFieldsManager.getFieldLabelTranslation(acp);
        const contacts = activity[acp].map(c => {
          const hydratedC = hydratedContactsByIds[c[CONTACT].id];
          return hydratedC ? this.renderContact(hydratedC) : null;
        });
        const content = contacts.length ? contacts : this.renderNoContacts();
        const contentClass = contacts.length ? styles.tableCell : null;

        return (
          <div key="contact-group">
            <div key="title" className={styles.sector_title}>{title}</div>
            <div key="contacts" className={contentClass}>{content}</div>
          </div>);
      })
      // TODO tablify must not reverses the order
      .reverse();
    return <Tablify key="contact-info" content={contactGroups} columns={ACTIVITY_CONTACT_COLS} />;
  }
}

export default Section(APContact, 'Contact Information', true, 'APContact');
