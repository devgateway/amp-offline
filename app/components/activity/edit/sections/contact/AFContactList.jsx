/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Row } from 'react-bootstrap';
import styles from '../../components/AFList.css';
import { ContactFormPage } from '../../../../../containers/ContactPage';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import AFField from '../../components/AFField';

/**
 * AF Contact group list
 *
 * @author Nadejda Mandrescu
 */
export default class AFContactList extends Component {
  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    contactReducer: PropTypes.object.isRequired,
  };

  static propTypes = {
    values: PropTypes.array.isRequired,
    listPath: PropTypes.string.isRequired,
    onDeleteRow: PropTypes.func,
    onEditRow: PropTypes.func,
    language: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.toContactItem = this.toContactItem.bind(this);
    this.state = {
      values: this.props.values
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ values: nextProps.values });
  }

  changePrimary(contactRow, wasPrimary, isNowPrimary) {
    if (isNowPrimary === wasPrimary) {
      return;
    }
    if (isNowPrimary) {
      const existingPrimary = this.state.values.find(v => v !== contactRow && v[AC.PRIMARY_CONTACT]);
      if (existingPrimary) {
        existingPrimary[AC.PRIMARY_CONTACT] = false;
        this.handleEdit(existingPrimary, AC.PRIMARY_CONTACT);
      }
    }
    this.handleEdit(contactRow, AC.PRIMARY_CONTACT);
  }

  handleEdit(row, fieldName) {
    this.props.onEditRow(row, fieldName, row[fieldName]);
  }

  toContactItem(contactRow) {
    const contactId = contactRow[AC.CONTACT].id;
    // TODO styling
    return (
      <Row key={contactRow.uniqueId}>
        <Col md={7} lg={7} >
          <ContactFormPage contactId={contactId} onEdit={() => this.handleEdit(contactRow, AC.CONTACT)} />
        </Col>
        <Col md={1} lg={1} >
          <AFField
            parent={contactRow} fieldPath={`${this.props.listPath}~${AC.PRIMARY_CONTACT}`}
            onAfterUpdate={this.changePrimary.bind(this, contactRow, contactRow[AC.PRIMARY_CONTACT])} />
        </Col>
        <Col md={1} lg={1}>
          <a
            onClick={() => this.props.onDeleteRow(contactRow.uniqueId)} className={styles.delete} href={null}>
            <span>&nbsp;</span>
          </a>
        </Col>
      </Row>
    );
  }

  render() {
    const contactForms = this.state.values.map(this.toContactItem);
    return <Grid>{contactForms}</Grid>;
  }
}
