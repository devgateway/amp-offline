import React from 'react';
import { ContactConstants } from 'amp-ui';
import { Col, Row } from 'react-bootstrap';
import * as styles from './ContactForm.css';
import AFField from '../../activity/edit/components/AFField';
import * as Types from '../../activity/edit/components/AFComponentTypes';
import EntryListWrapper from '../../common/edit/EntryListWrapper';

/**
 * Contact Email section
 *
 * @author Nadejda Mandrescu
 */

const getEntryFunc = (id, email) => (
  <Row key={id}>
    <Col lg={4} md={4} className={styles.emailCol}>
      <AFField
        parent={email} fieldPath={`${ContactConstants.EMAIL}~${ContactConstants.VALUE}`}
        showLabel={false} inline type={Types.INPUT_TYPE} />
    </Col>
  </Row>
);

const ContactEmail = EntryListWrapper('Add Contact Email', getEntryFunc, ContactConstants.EMAIL);
export default ContactEmail;
