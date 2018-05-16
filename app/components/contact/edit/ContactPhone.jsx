import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Row } from 'react-bootstrap';
import Logger from '../../../modules/util/LoggerManager';
import * as styles from './ContactForm.css';
import EntryList from '../../common/edit/EntryList';
import * as CC from '../../../utils/constants/ContactConstants';
import AFField from '../../activity/edit/components/AFField';
import * as Types from '../../activity/edit/components/AFComponentTypes';
import translate from '../../../utils/translate';

const logger = new Logger('ContactPhone');

/**
 * Contact Phone section
 *
 * @author Nadejda Mandrescu
 */
export default class ContactPhone extends Component {
  static propTypes = {
    contact: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.state = {};
  }

  getEntry(phone) {
    return (
      <Row>
        <Col lg={4} md={4}>
          <AFField parent={phone} fieldPath={`${CC.PHONE}~${CC.TYPE}`} showLabel={false} />
        </Col>
        <Col lg={4} md={5}>
          <AFField
            parent={phone} fieldPath={`${CC.PHONE}~${CC.VALUE}`} showLabel={false} inline type={Types.INPUT_TYPE} />
        </Col>
        <Col lg={4} md={5} className={styles.phoneExtensionCol}>
          <AFField
            parent={phone} fieldPath={`${CC.PHONE}~${CC.EXTENSION_VALUE}`} inline type={Types.INPUT_TYPE}
            className={styles.phoneExtension} />
        </Col>
      </Row>
    );
  }

  render() {
    const phones = (this.props.contact[CC.PHONE] || []).map(this.getEntry);
    return (
      <Grid>
        <EntryList label={translate('Add Contact Phone')} className={styles.phoneContainer}>
          {phones}
        </EntryList>
      </Grid>
    );
  }
}
