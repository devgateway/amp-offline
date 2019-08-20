import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { ContactConstants } from 'amp-ui';
import * as styles from './ContactForm.css';
import AFField from '../../activity/edit/components/AFField';
import * as Types from '../../activity/edit/components/AFComponentTypes';
import EntryListWrapper from '../../common/edit/EntryListWrapper';

/**
 * Contact Fax section
 *
 * @author Nadejda Mandrescu
 */

const getEntryFunc = (id, fax) => (
  <Row key={id}>
    <Col lg={4} md={4} className={styles.emailCol}>
      <AFField
        parent={fax} fieldPath={`${ContactConstants.FAX}~${ContactConstants.VALUE}`}
        showLabel={false} inline type={Types.INPUT_TYPE} />
    </Col>
  </Row>
);

const ContactFax = EntryListWrapper('Add Contact Fax', getEntryFunc, ContactConstants.FAX);
export default ContactFax;
