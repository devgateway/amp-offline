/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, Grid, Row } from 'react-bootstrap';
import * as styles from './ContactForm.css';
import * as afStyles from '../../activity/edit/ActivityForm.css';
import * as CC from '../../../utils/constants/ContactConstants';
import FieldsManager from '../../../modules/field/FieldsManager';
import EntityValidator from '../../../modules/field/EntityValidator';
import AFField from '../../activity/edit/components/AFField';
import { INPUT_TYPE, TEXT_AREA } from '../../activity/edit/components/AFComponentTypes';
import ContactPhone from './ContactPhone';
import ContactEmail from './ContactEmail';
import ContactFax from './ContactFax';
import * as Utils from '../../../utils/Utils';

/**
 * Contact Form
 *
 * @author Nadejda Mandrescu
 */
class ContactForm extends Component {
  static contextTypes = {
    contactReducer: PropTypes.object.isRequired,
    updateContact: PropTypes.func.isRequired,
  };

  static propTypes = {
    contactId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    // onEdit: PropTypes.func.isRequired,
  };

  static childContextTypes = {
    contactReducer: PropTypes.object,
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(EntityValidator),
    isSaveAndSubmit: PropTypes.bool,
    updateContact: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    // TODO new contact
    this.state = {
      contact: null,
      reloading: false,
    };
    this._formId = Utils.stringToUniqueId();
    this.handleEntriesChange = this.handleEntriesChange.bind(this);
  }

  getChildContext() {
    return {
      ...this.context,
      activityFieldsManager: this.context.contactReducer.contactFieldsManager,
      activityValidator: this.contactValidator,
    };
  }

  componentWillMount() {
    this.init(this.context);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.init(nextContext);
  }

  /**
   * Updating with dispatch will make input slow, but we still need to reload in another AF contact form this contact.
   * The update in another contact form for the same contact is handled through checkForUpdates.
   * @param contact
   */
  onUpdate(contact) {
    contact[CC.TMP_FORM_ID] = this._formId;
  }

  /**
   * See {onUpdate} for more details
   */
  checkForUpdates() {
    const { contact } = this.state;
    if (contact[CC.TMP_FORM_ID] !== this._formId) {
      this.onUpdate(contact);
      this.setState({ reloading: true });
      this.context.updateContact({ contact });
    }
  }

  init(context) {
    const { contactFieldsManager, contactsByIds } = context.contactReducer;
    const contact = contactsByIds[this.props.contactId];
    const hydratedContact = contact && contact[CC.TMP_HYDRATED] ? contact : null;
    if (hydratedContact) {
      this._initLists(hydratedContact);
      this.setState({ contact: hydratedContact, reloading: false });
    }
    if (contactFieldsManager && !this.contactValidator && hydratedContact) {
      this.contactValidator = new EntityValidator(hydratedContact, contactFieldsManager, []);
    }
  }

  _initLists(contact) {
    [CC.EMAIL, CC.FAX, CC.PHONE].forEach(l => (contact[l] = contact[l] || []));
  }

  handleEntriesChange(fieldName, newItems) {
    const { contact } = this.state;
    contact[fieldName] = newItems;
    this.onUpdate(contact);
  }

  render() {
    const { contact, reloading } = this.state;
    if (!contact || !this.contactValidator) {
      return null;
    }

    const onUpdate = () => this.onUpdate(contact);

    // TODO there API bus, adding explicit field types as a workaround (remove when fixed)
    return (
      <div className={styles.contactForm}>
        <div className={styles.display_inline}>
          <div className={reloading && afStyles.loader} />
        </div>
        <FormGroup disabled={reloading}>
          <Grid onClick={this.checkForUpdates.bind(this)} onFocus={this.checkForUpdates.bind(this)} >
            <Row key={CC.TITLE}>
              <Col lg={3} md={3}>
                <AFField parent={contact} fieldPath={CC.TITLE} onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key="full-name">
              <Col lg={6} md={6} key={CC.NAME}>
                <AFField parent={contact} fieldPath={CC.NAME} type={INPUT_TYPE} onAfterUpdate={onUpdate} />
              </Col>
              <Col lg={6} md={6} key={CC.LAST_NAME}>
                <AFField parent={contact} fieldPath={CC.LAST_NAME} type={INPUT_TYPE} onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key={CC.EMAIL}>
              <Col lg={9} md={9} className={styles.entryList}>
                <ContactEmail items={contact[CC.EMAIL]} onChange={this.handleEntriesChange.bind(this, CC.EMAIL)} />
              </Col>
            </Row>
            <Row key="function">
              <Col lg={6} md={6} key={CC.FUNCTION}>
                <AFField parent={contact} fieldPath={CC.FUNCTION} type={INPUT_TYPE} onAfterUpdate={onUpdate} />
              </Col>
              <Col lg={6} md={6} key={CC.ORGANIZATION_NAME}>
                <AFField parent={contact} fieldPath={CC.ORGANIZATION_NAME} type={INPUT_TYPE} onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key={CC.ORGANISATION_CONTACTS}>
              <Col lg={9} md={9} className={styles.orgsList}>
                <AFField parent={contact} fieldPath={CC.ORGANISATION_CONTACTS} onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key={CC.PHONE}>
              <Col lg={9} md={9} className={styles.entryList}>
                <ContactPhone items={contact[CC.PHONE]} onChange={this.handleEntriesChange.bind(this, CC.PHONE)} />
              </Col>
            </Row>
            <Row key={CC.FAX}>
              <Col lg={6} md={6} className={styles.entryList}>
                <ContactFax items={contact[CC.FAX]} onChange={this.handleEntriesChange.bind(this, CC.FAX)} />
              </Col>
            </Row>
            <Row key={CC.OFFICE_ADDRESS}>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.OFFICE_ADDRESS} type={TEXT_AREA} onAfterUpdate={onUpdate} />
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </div>
    );
  }
}

export default ContactForm;
