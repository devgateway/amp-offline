import React, { Component } from 'react';
import AFSection from './AFSection';
import { CONTACTS } from './AFSectionConstants';
import { ContactFormPage } from '../../../../containers/ContactPage';

/**
 * AF Contacts Section
 *
 * @author Nadejda Mandrescu
 */
class AFContacts extends Component {
  render() {
    return <ContactFormPage />;
  }

}

export default AFSection(AFContacts, CONTACTS);
