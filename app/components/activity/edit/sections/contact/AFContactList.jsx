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
    this.handleRemove = this.handleRemove.bind(this);
    this.toContactItem = this.toContactItem.bind(this);
    this.state = {
      values: this.props.values
    };
  }

  handleRemove(id) {
    this.props.onDeleteRow(id);
    const values = this.state.values.filter(v => v.id !== id);
    this.setState({ values });
  }

  toContactItem(contactOption) {
    const { listPath, onEditRow } = this.props;
    const onItemEdit = (col) => onEditRow(contactOption, col, contactOption[col]);
    const contactId = contactOption[AC.CONTACT].id;
    const pcFieldPath = `${listPath}~${AC.PRIMARY_CONTACT}`;
    // TODO styling
    return (
      <Row key={contactOption.uniqueId}>
        <Col md={7} lg={7} >
          <ContactFormPage contactId={contactId} onEdit={() => onItemEdit(AC.CONTACT)} />
        </Col>
        <Col md={1} lg={1} >
          <AFField
            parent={contactOption} fieldPath={pcFieldPath} onAfterUpdate={() => onItemEdit(AC.PRIMARY_CONTACT)} />
        </Col>
        <Col md={1} lg={1}>
          <a
            onClick={this.handleRemove.bind(contactOption.uniqueId)} className={styles.delete} href={null}>
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
