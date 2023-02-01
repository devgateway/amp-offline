/* eslint-disable class-methods-use-this,jsx-a11y/anchor-has-content */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Grid, Panel, Row } from 'react-bootstrap';
import { ActivityConstants, FieldsManager, UIUtils } from 'amp-ui';
import * as styles from './AFContactList.css';
import * as afStyles from '../../ActivityForm.css';
import { ContactFormPage } from '../../../../../containers/ContactPage';
import AFField from '../../components/AFField';
import { buildNewActivityContact } from '../../../../../actions/ContactAction';
import * as entryListStyles from '../../../../common/edit/EntryList.css';

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
    filterForUnhydratedByIds: PropTypes.func.isRequired,
    updateContact: PropTypes.func.isRequired,
  };

  static propTypes = {
    values: PropTypes.array.isRequired,
    listPath: PropTypes.string.isRequired,
    onDeleteRow: PropTypes.func,
    onEditRow: PropTypes.func,
    // language: PropTypes.string,
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
      const existingPrimary = this.state.values.find(v => v !== contactRow && v[ActivityConstants.PRIMARY_CONTACT]);
      if (existingPrimary) {
        existingPrimary[ActivityConstants.PRIMARY_CONTACT] = false;
        this.handleEdit(existingPrimary, ActivityConstants.PRIMARY_CONTACT);
      }
    }
    contactRow[ActivityConstants.PRIMARY_CONTACT] = isNowPrimary;
    this.handleEdit(contactRow, ActivityConstants.PRIMARY_CONTACT);
    this.setState({ values: Array.from(this.state.values) });
  }

  handleAdd(activityContactsField) {
    const activityContact = buildNewActivityContact(this.context.contactReducer.contactFieldsManager);
    if (!this.context.activity[activityContactsField]) {
      this.context.activity[activityContactsField] = [];
    }
    this.context.activity[activityContactsField].push(activityContact);
    this.context.updateContact(activityContact[ActivityConstants.CONTACT]);
  }

  handleEdit(row, fieldName) {
    this.props.onEditRow(row, fieldName, row[fieldName]);
  }

  doNotTogglePanel(e) {
    e.stopPropagation();
  }

  isContactHydrated(contactId) {
    const { isContactsLoading, isContactLoading } = this.context.contactReducer;
    return !isContactsLoading && !isContactLoading && !this.context.filterForUnhydratedByIds([contactId]).length;
  }

  toContactItem(contactRow) {
    const contactId = contactRow[ActivityConstants.CONTACT].id;
    const cFullName = contactRow[ActivityConstants.CONTACT].displayFullValue;
    const isNowPrimary = contactRow[ActivityConstants.PRIMARY_CONTACT];
    contactRow.uniqueId = contactRow.uniqueId || UIUtils.stringToUniqueId(); // generate for new contacts
    const header = (
      <div>
        <Row key={contactRow.uniqueId}>
          <Col md={9} lg={9} className={styles.contactHeader}>
            <span className={styles.headerLink}>{cFullName}</span>
          </Col>
          <Col md={3} lg={3} className={styles.primaryCol} onClick={this.doNotTogglePanel}>
            <AFField
              parent={contactRow} fieldPath={`${this.props.listPath}~${ActivityConstants.PRIMARY_CONTACT}`}
              className={styles.primaryField} inline
              onAfterUpdate={this.changePrimary.bind(this, contactRow, isNowPrimary)} />
          </Col>
          <Col md={1} lg={1} className={styles.deleteCol}>
            <a onClick={() => this.props.onDeleteRow(contactRow.uniqueId)} className={styles.delete} href={null} />
          </Col>
        </Row>
      </div>
    );
    const isContactHydrated = this.isContactHydrated(contactId);
    return (
      <Panel key={contactRow.uniqueId} defaultExpanded>
        <Panel.Heading>
          <Panel.Title toggle>{header}</Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <Row>
              <Col md={13} lg={13}>
                {isContactHydrated &&
                  <ContactFormPage
                    contactId={contactId} onEdit={() => this.handleEdit(contactRow, ActivityConstants.CONTACT)} />}
              </Col>
            </Row>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }

  render() {
    const contactForms = this.state.values.map(this.toContactItem);
    return (
      <span>
        <div className={[entryListStyles.addButton, styles.addButton].join(' ')}>
          <a onClick={this.handleAdd.bind(this, this.props.listPath)} href={null} />
        </div>
        <Grid className={afStyles.full_width}>{contactForms}</Grid>
      </span>
    );
  }
}
