import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';
import AFOption from './AFOption';
import FieldsManager from '../../../../modules/field/FieldsManager';
import {
  MULTI_SELECT_MAX_SIZE,
  MULTI_SELECT_MIN_SIZE,
} from '../../../../utils/constants/ActivityConstants';
import * as styles from './AFMultiSelect.css';

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
    values: PropTypes.array.isRequired,
    listPath: PropTypes.string.isRequired,
    selectField: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.listDef = this.context.activityFieldsManager.getFieldDef(this.props.listPath);
    if (this.listDef.children) {
      this.selectFieldDef = this.listDef.children.find(f => f.field_name === this.props.selectField);
    } else {
      this.selectFieldDef = this.listDef;
    }
    this.isIdNumber = this.selectFieldDef && this.selectFieldDef.field_type === 'long';
  }

  getSelectedIds() {
    return (this.props.values || []).map(v => v[this.props.selectField].id);
  }

  handleChange(e) {
    const selectedIds = new Set(
      Array.from(e.target.selectedOptions || []).map(so => (this.isIdNumber ? +so.value : so.value)));
    const values = this.props.options.filter(o => selectedIds.has(o.id)).map(o => ({ [this.props.selectField]: o }));
    this.props.onChange(values);
  }

  render() {
    if (!this.selectFieldDef) {
      return null;
    }
    const { options } = this.props;
    const selectedIds = this.getSelectedIds();
    const size = Math.max(MULTI_SELECT_MIN_SIZE, Math.min(options.length, MULTI_SELECT_MAX_SIZE));
    return (
      <div>
        <FormControl
          componentClass="select" multiple onChange={this.handleChange.bind(this)} size={size}
          value={selectedIds}
          className={styles.fitContent}>
          {options.map(option =>
            <option key={option.id} value={option.id} >
              {option.translatedValue}
            </option>
          )}
        </FormControl>
      </div>
    );
  }
}
