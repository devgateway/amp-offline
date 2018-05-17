import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, Grid, Row } from 'react-bootstrap';
import * as styles from './ContactForm.css';
import * as CC from '../../../utils/constants/ContactConstants';
import FieldsManager from '../../../modules/field/FieldsManager';
import EntityValidator from '../../../modules/field/EntityValidator';
import AFField from '../../activity/edit/components/AFField';
import { INPUT_TYPE, TEXT_AREA } from '../../activity/edit/components/AFComponentTypes';
import ContactPhone from './ContactPhone';
import ContactEmail from './ContactEmail';

/**
 * Contact Form
 *
 * @author Nadejda Mandrescu
 */
class ContactForm extends Component {
  static contextTypes = {
    contactReducer: PropTypes.object.isRequired,
  };

  static propTypes = {
    contactId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onEdit: PropTypes.func.isRequired,
  };

  static childContextTypes = {
    contactReducer: PropTypes.object,
    activity: PropTypes.object,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager),
    activityValidator: PropTypes.instanceOf(EntityValidator),
    isSaveAndSubmit: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    // TODO new contact
    this.state = {
      contact: null
    };
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

  init(context) {
    const { contactFieldsManager, contactsByIds } = context.contactReducer;
    const hydratedContact = contactsByIds[this.props.contactId];
    if (hydratedContact !== this.state.contact) {
      this.setState({ contact: hydratedContact });
    }
    if (contactFieldsManager && !this.contactValidator && hydratedContact) {
      this.contactValidator = new EntityValidator(hydratedContact, contactFieldsManager, []);
    }
  }

  render() {
    const { contact } = this.state;
    if (!contact || !this.contactValidator) {
      return null;
    }

    // TODO there API bus, adding explicit field types as a workaround (remove when fixed)
    return (
      <div className={styles.contactForm}>
        <FormGroup>
          <Grid>
            <Row key={CC.TITLE}>
              <Col lg={3} md={3}>
                <AFField parent={contact} fieldPath={CC.TITLE} />
              </Col>
            </Row>
            <Row key="full-name">
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.NAME} type={INPUT_TYPE} />
              </Col>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.LAST_NAME} type={INPUT_TYPE} />
              </Col>
            </Row>
            <Row key={CC.EMAIL}>
              <Col lg={9} md={9} className={styles.entryList}>
                <ContactEmail items={contact && contact[CC.EMAIL]} />
              </Col>
            </Row>
            <Row key="function">
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.FUNCTION} type={INPUT_TYPE} />
              </Col>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.ORGANIZATION_NAME} type={INPUT_TYPE} />
              </Col>
            </Row>
            <Row key={CC.ORGANISATION_CONTACTS}>
              <Col lg={9} md={9} className={styles.orgsList}>
                <AFField parent={contact} fieldPath={CC.ORGANISATION_CONTACTS} />
              </Col>
            </Row>
            <Row key={CC.PHONE}>
              <Col lg={9} md={9} className={styles.entryList}>
                <ContactPhone items={contact && contact[CC.PHONE]} />
              </Col>
            </Row>
            <Row key={CC.FAX}>
              <Col lg={6} md={6}>
                <div>TODO contact fax</div>
              </Col>
            </Row>
            <Row key={CC.OFFICE_ADDRESS}>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.OFFICE_ADDRESS} type={TEXT_AREA} />
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </div>
    );
  }
}

export default ContactForm;
