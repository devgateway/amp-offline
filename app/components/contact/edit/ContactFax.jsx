import React from 'react';
import { Col, Row } from 'react-bootstrap';
import * as styles from './ContactForm.css';
import * as CC from '../../../utils/constants/ContactConstants';
import AFField from '../../activity/edit/components/AFField';
import * as Types from '../../activity/edit/components/AFComponentTypes';
import EntryListWrapper from '../../common/edit/EntryListWrapper';

/**
 * Contact Fax section
 *
 * @author Nadejda Mandrescu
 */

const getEntryFunc = (fax) => (
  <Row>
    <Col lg={4} md={4} className={styles.emailCol}>
      <AFField parent={fax} fieldPath={`${CC.FAX}~${CC.VALUE}`} showLabel={false} inline type={Types.INPUT_TYPE} />
    </Col>
  </Row>
);

const ContactFax = EntryListWrapper('Add Contact Fax', getEntryFunc);
export default ContactFax;
