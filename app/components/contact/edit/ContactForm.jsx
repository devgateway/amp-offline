/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, Grid, HelpBlock, Row } from 'react-bootstrap';
import { FieldPathConstants, FieldsManager, UIUtils, ContactConstants, WorkspaceConstants } from 'amp-ui';
import * as styles from './ContactForm.css';
import * as afStyles from '../../activity/edit/ActivityForm.css';
import EntityValidator from '../../../modules/field/EntityValidator';
import AFField from '../../activity/edit/components/AFField';
import { CUSTOM, INPUT_TYPE, TEXT_AREA } from '../../activity/edit/components/AFComponentTypes';
import ContactPhone from './ContactPhone';
import ContactEmail from './ContactEmail';
import ContactFax from './ContactFax';
import translate from '../../../utils/translate';

/**
 * Contact Form
 *
 * @author Nadejda Mandrescu
 */
class ContactForm extends Component {
  static contextTypes = {
    contactReducer: PropTypes.object.isRequired,
    updateContact: PropTypes.func.isRequired,
    activity: PropTypes.object,
    workspaceReducer: PropTypes.object
  };

  static propTypes = {
    contactId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  };

  static childContextTypes = {
    contactReducer: PropTypes.object,
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(EntityValidator),
    updateContact: PropTypes.func.isRequired,
    workspaceReducer: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      contact: null,
      reloading: false,
      isAF: false,
      // Contact Form has special validation behavior for max size and hence will be handled for display in the form.
      // There is still max size validation within EntityValidator, in case the max size is changed
      // and some old contacts have more entries than currently allowed.
      maxSizeValidation: {}, // { <list_field> : { error } }
    };
    this._formId = UIUtils.stringToUniqueId();
    this.handleEntriesChange = this.handleEntriesChange.bind(this);
  }

  getChildContext() {
    const { contact } = this.state;
    return {
      ...this.context,
      activityFieldsManager: this.context.contactReducer.contactFieldsManager,
      activityValidator: contact && contact[ContactConstants.TMP_ENTITY_VALIDATOR],
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
    contact[ContactConstants.TMP_FORM_ID] = this._formId;
    contact[ContactConstants.TMP_ENTITY_VALIDATOR].entity = contact;
    this.setState({ contact });
  }

  /**
   * See {onUpdate} for more details
   */
  checkForUpdates() {
    const { contact } = this.state;
    if (contact[ContactConstants.TMP_FORM_ID] !== this._formId) {
      this.onUpdate(contact);
      this.setState({ reloading: true });
      this.context.updateContact(contact);
    }
  }

  init(context) {
    const { contactsByIds } = context.contactReducer;
    const contact = contactsByIds[this.props.contactId];
    const hydratedContact = contact && contact[ContactConstants.TMP_HYDRATED] ? contact : null;
    if (hydratedContact) {
      this._initLists(hydratedContact, context);
      this.setState({ reloading: false, isAF: !!context.activity });
      this.onUpdate(hydratedContact);
    }
  }

  _initLists(contact, context) {
    const { contactFieldsManager } = context.contactReducer;
    const { maxSizeValidation } = this.state;
    [ContactConstants.EMAIL, ContactConstants.FAX, ContactConstants.PHONE].forEach(l => {
      contact[l] = contact[l] || [];
      maxSizeValidation[l] = {
        fieldDef: contactFieldsManager.getFieldDef(l),
        error: null
      };
    });
    contact[ContactConstants.ORGANISATION_CONTACTS] = contact[ContactConstants.ORGANISATION_CONTACTS] || [];
  }

  handleEntriesChange(fieldName, newItems) {
    const { contactFieldsManager } = this.context.contactReducer;
    const { contact, maxSizeValidation } = this.state;
    // Contacts allow to press add button, but the entry must not be added in fact, while the error message should
    // still appear. This is not in line with EntityValidator that reports errors when they are actually present.
    // Hence we'll .pop() the last item (__ADD_ENTRY_ASSUMPTION__) and display the error using ContactForm.
    const currentMaxSizeValidation = maxSizeValidation[fieldName];
    const { fieldDef } = currentMaxSizeValidation;
    const maxListSize = fieldDef[FieldPathConstants.LIST_MAX_SIZE];
    if (maxListSize && maxListSize < newItems.length) {
      const fieldLabel = contactFieldsManager.getFieldLabelTranslation(fieldName,
        this.context.workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]);
      newItems.pop();
      currentMaxSizeValidation.error = translate('listTooLong')
        .replace('%fieldName%', fieldLabel).replace('%sizeLimit%', maxListSize);
    } else {
      currentMaxSizeValidation.error = false;
    }
    contact[fieldName] = newItems;
    this.onUpdate(contact);
    this.setState({ maxSizeValidation });
  }

  render() {
    const { contact, reloading, isAF, maxSizeValidation } = this.state;
    if (!contact) {
      return null;
    }

    const onUpdate = () => this.onUpdate(contact);
    const errorStyle =
      [afStyles.activity_form_control, styles.maxSizeError, afStyles.help_block, 'has-error'].join(' ');

    // TODO there API bus, adding explicit field types as a workaround (remove when fixed)
    return (
      <div className={styles.contactForm}>
        <div className={styles.display_inline}>
          <div className={reloading && afStyles.loader} />
        </div>
        <FormGroup disabled={reloading}>
          <Grid onClick={this.checkForUpdates.bind(this)} onFocus={this.checkForUpdates.bind(this)} >
            <Row key={ContactConstants.TITLE}>
              <Col lg={3} md={3}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.TITLE} customLabel={isAF ? 'Contact Title' : null}
                  onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key="full-name">
              <Col lg={6} md={6} key={ContactConstants.NAME}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.NAME} type={INPUT_TYPE}
                  customLabel={isAF ? 'contact first name' : null}
                  onAfterUpdate={onUpdate} />
              </Col>
              <Col lg={6} md={6} key={ContactConstants.LAST_NAME}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.LAST_NAME} type={INPUT_TYPE}
                  customLabel={isAF ? 'contact lastname' : null}
                  onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key={ContactConstants.EMAIL}>
              <Col lg={9} md={9} className={styles.entryList}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.EMAIL} showLabel={false}
                  type={CUSTOM} className={styles.keepFontSize}>
                  <ContactEmail
                    items={contact[ContactConstants.EMAIL]}
                    onEntriesChange={this.handleEntriesChange.bind(this, ContactConstants.EMAIL)} />
                </AFField>
                <div className={errorStyle}>
                  <HelpBlock>{maxSizeValidation[ContactConstants.EMAIL].error}</HelpBlock></div>
              </Col>
            </Row>
            <Row key="function">
              <Col lg={6} md={6} key={ContactConstants.FUNCTION}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.FUNCTION} type={INPUT_TYPE}
                  customLabel={isAF ? 'contact function' : null}
                  onAfterUpdate={onUpdate} />
              </Col>
              <Col lg={6} md={6} key={ContactConstants.ORGANIZATION_NAME}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.ORGANIZATION_NAME} type={INPUT_TYPE}
                  customLabel={isAF ? 'organisationName' : null}
                  onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key={ContactConstants.ORGANISATION_CONTACTS}>
              <Col lg={9} md={9} className={styles.orgsList}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.ORGANISATION_CONTACTS}
                  customLabel={isAF ? 'Contact Organizations' : null}
                  onAfterUpdate={onUpdate} />
              </Col>
            </Row>
            <Row key={ContactConstants.PHONE}>
              <Col lg={9} md={9} className={styles.entryList}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.PHONE} showLabel={false}
                  type={CUSTOM} className={styles.keepFontSize}>
                  <ContactPhone
                    items={contact[ContactConstants.PHONE]}
                    onEntriesChange={this.handleEntriesChange.bind(this, ContactConstants.PHONE)} />
                </AFField>
                <div className={errorStyle}><HelpBlock>{maxSizeValidation[ContactConstants.PHONE].error}</HelpBlock>
                </div>
              </Col>
            </Row>
            <Row key={ContactConstants.FAX}>
              <Col lg={6} md={6} className={styles.entryList}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.FAX} showLabel={false}
                  type={CUSTOM} className={styles.keepFontSize}>
                  <ContactFax
                    items={contact[ContactConstants.FAX]}
                    onEntriesChange={this.handleEntriesChange.bind(this, ContactConstants.FAX)} />
                </AFField>
                <div className={errorStyle}><HelpBlock>{maxSizeValidation[ContactConstants.FAX].error}</HelpBlock></div>
              </Col>
            </Row>
            <Row key={ContactConstants.OFFICE_ADDRESS}>
              <Col lg={6} md={6}>
                <AFField
                  parent={contact} fieldPath={ContactConstants.OFFICE_ADDRESS} type={TEXT_AREA}
                  customLabel={isAF ? 'contact office address' : null}
                  onAfterUpdate={onUpdate} />
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </div>
    );
  }
}

export default ContactForm;
