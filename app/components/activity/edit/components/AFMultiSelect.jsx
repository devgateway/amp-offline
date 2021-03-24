/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import AFOption from './AFOption';
import * as styles from './AFMultiSelect.css';
import FieldDefinition from '../../../../modules/field/FieldDefinition';

/**
 * MultiSelect component
 *
 * @author Nadejda Mandrescu
 */
export default class AFMultiSelect extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
  };

  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.instanceOf(AFOption)).isRequired,
    values: PropTypes.array,
    listPath: PropTypes.string.isRequired,
    selectField: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.listDef = new FieldDefinition(this.context.activityFieldsManager.getFieldDef(this.props.listPath));
    if (this.listDef.isSimpleTypeList()) {
      this.selectFieldDef = this.listDef;
    } else {
      this.selectFieldDef = this.listDef.children.find(f => f.field_name === this.props.selectField);
    }
    this.selectFieldDef = new FieldDefinition(this.selectFieldDef);
    this.isIdNumber = this.getIdAsNumber(this.selectFieldDef);
  }

  getIdAsNumber(fieldDef: FieldDefinition) {
    if (fieldDef) {
      const entryType = fieldDef.isSimpleTypeList() ? fieldDef.itemType : fieldDef.type;
      return entryType === 'long';
    }
    return false;
  }

  getSelectedIds() {
    const values = (this.props.values || []);
    if (this.selectFieldDef.isSimpleTypeList()) {
      return values.map(v => v !== undefined && v.id);
    }
    return values.map(v => v[this.props.selectField].id);
  }

  handleChange(e) {
    const selectedIds = new Set(
      Array.from(e.target.selectedOptions || []).map(so => (this.isIdNumber ? +so.value : so.value)));
    let values = this.props.options.filter(o => selectedIds.has(o.id));
    if (!this.selectFieldDef.isSimpleTypeList()) {
      values = values.map(o => ({ [this.props.selectField]: o }));
    }
    this.props.onChange(values);
  }

  render() {
    if (!this.selectFieldDef) {
      return null;
    }
    const { options } = this.props;
    const selectedIds = this.getSelectedIds();
    const size = Math.max(ActivityConstants.MULTI_SELECT_MIN_SIZE,
      Math.min(options.length, ActivityConstants.MULTI_SELECT_MAX_SIZE));
    return (
      <div>
        <FormControl
          componentClass="select" multiple onChange={this.handleChange.bind(this)} size={size}
          value={selectedIds}
          className={styles.fitContent}>
          {options.map(option =>
            <option key={option.id} value={option.id}>
              {option.translatedValue}
            </option>
          )}
        </FormControl>
      </div>
    );
  }
}
