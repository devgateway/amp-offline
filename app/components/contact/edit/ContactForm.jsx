import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Panel, Row } from 'react-bootstrap';
import * as CC from '../../../utils/constants/ContactConstants';
import FieldsManager from '../../../modules/field/FieldsManager';
import EntityValidator from '../../../modules/field/EntityValidator';
import AFField from '../../activity/edit/components/AFField';
import { INPUT_TYPE, TEXT_AREA } from '../../activity/edit/components/AFComponentTypes';

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
      <div>
        <Panel header={`${contact[CC.NAME]} ${contact[CC.LAST_NAME]}`} collapsible defaultExpanded>
          <Grid>
            <Row>
              <Col lg={2} md={2}>
                <AFField parent={contact} fieldPath={CC.TITLE} />
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.NAME} type={INPUT_TYPE} />
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.LAST_NAME} type={INPUT_TYPE} />
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <div>TODO add contact email</div>
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.FUNCTION} type={INPUT_TYPE} />
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.ORGANIZATION_NAME} type={INPUT_TYPE} />
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <div>TODO contact organizations</div>
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <div>TODO contact phones</div>
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <div>TODO contact fax</div>
              </Col>
            </Row>
            <Row>
              <Col lg={6} md={6}>
                <AFField parent={contact} fieldPath={CC.OFFICE_ADDRESS} type={TEXT_AREA} />
              </Col>
            </Row>
          </Grid>
        </Panel>
      </div>
    );
  }
}

export default ContactForm;
