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
import * as Utils from '../../../utils/Utils';

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
    this.state = {
      uniqueIdPhones: null,
    };
    this.setUniquePhoneIdsAndUpdateState(props.contact[CC.PHONE]);
  }

  componentWillReceiveProps(nextProps) {
    this.setUniquePhoneIdsAndUpdateState(nextProps.contact[CC.PHONE]);
  }

  onRemove(uniqueId) {
    let { uniqueIdPhones } = this.state;
    uniqueIdPhones = uniqueIdPhones.filter(([uId]) => uId !== uniqueId);
    this.setState({ uniqueIdPhones });
  }

  setUniquePhoneIdsAndUpdateState(phones) {
    if (!phones) {
      return;
    }
    const uniqueIdPhones = phones.map(p => ([Utils.stringToUniqueId('phone'), p]));
    this.setState({ uniqueIdPhones });
  }

  getEntry(phone) {
    return (
      <Row>
        <Col lg={4} md={4}>
          <AFField parent={phone} fieldPath={`${CC.PHONE}~${CC.TYPE}`} showLabel={false} />
        </Col>
        <Col lg={4} md={4}>
          <AFField
            parent={phone} fieldPath={`${CC.PHONE}~${CC.VALUE}`} showLabel={false} inline type={Types.INPUT_TYPE} />
        </Col>
        <Col lg={4} md={4} className={styles.phoneExtensionCol}>
          <AFField
            parent={phone} fieldPath={`${CC.PHONE}~${CC.EXTENSION_VALUE}`} inline type={Types.INPUT_TYPE}
            className={styles.phoneExtension} />
        </Col>
      </Row>
    );
  }

  render() {
    const { uniqueIdPhones } = this.state;
    if (!uniqueIdPhones) {
      return null;
    }
    const phones = uniqueIdPhones.map(([, p]) => p);
    const ids = uniqueIdPhones.map(([uId]) => uId);

    return (
      <Grid>
        <EntryList
          label={translate('Add Contact Phone')} className={styles.phoneContainer}
          onRemove={this.onRemove.bind(this)} childrenIds={ids}>
          {phones.map(this.getEntry)}
        </EntryList>
      </Grid>
    );
  }
}
