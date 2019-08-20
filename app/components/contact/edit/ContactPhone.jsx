import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { ContactConstants } from 'amp-ui';
import * as styles from './ContactForm.css';
import AFField from '../../activity/edit/components/AFField';
import * as Types from '../../activity/edit/components/AFComponentTypes';
import EntryListWrapper from '../../common/edit/EntryListWrapper';

/**
 * Contact Phone section
 *
 * @author Nadejda Mandrescu
 */

const getEntryFunc = (id, phone) => (
  <Row key={id}>
    <Col lg={4} md={4}>
      <AFField parent={phone} fieldPath={`${ContactConstants.PHONE}~${ContactConstants.TYPE}`} showLabel={false} />
    </Col>
    <Col lg={4} md={4}>
      <AFField
        parent={phone} fieldPath={`${ContactConstants.PHONE}~${ContactConstants.VALUE}`}
        showLabel={false} inline type={Types.INPUT_TYPE} />
    </Col>
    <Col lg={4} md={4} className={styles.phoneExtensionCol}>
      <AFField
        parent={phone} fieldPath={`${ContactConstants.PHONE}~${ContactConstants.EXTENSION_VALUE}`}
        inline type={Types.INPUT_TYPE}
        customLabel="Extension"
        className={styles.phoneExtension} />
    </Col>
  </Row>
);

const ContactPhone = EntryListWrapper('Add Contact Phone', getEntryFunc, ContactConstants.PHONE);
export default ContactPhone;
