import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as CC from '../../../utils/constants/ContactConstants';
import FieldsManager from '../../../modules/field/FieldsManager';
import EntityValidator from '../../../modules/field/EntityValidator';

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
    return (
      <div>
        <div>{`${contact[CC.NAME]} ${contact[CC.LAST_NAME]}`}</div>
        <div>TODO Contact Form</div>
      </div>
    );
  }
}

export default ContactForm;
