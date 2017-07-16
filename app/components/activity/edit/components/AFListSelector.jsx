import React, { Component, PropTypes } from 'react';
import { Button, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import styles from './AFListSelector.css';
import AFList from './AFList';
import AFSearchList from './AFSearchList';
import AFOption from './AFOption';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityValidator from '../../../../modules/activity/ActivityValidator';
import { HIERARCHICAL_VALUE } from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import * as Utils from '../../../../utils/Utils';

/* eslint-disable class-methods-use-this */

/**
 * Activity Form List options selection, with possibility to add percentage and additional element input text
 * @author Nadejda Mandrescu
 */
export default class AFListSelector extends Component {
  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired,
  };

  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.instanceOf(AFOption)).isRequired,
    selectedOptions: PropTypes.array.isRequired,
    listPath: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.handleAddValue = this.handleAddValue.bind(this);
    this.handleRemoveValues = this.handleRemoveValues.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.dividePercentage = this.dividePercentage.bind(this);
    this.state = {
      values: [],
      validationError: null
    };
  }

  componentWillMount() {
    this.listDef = this.context.activityFieldsManager.getFieldDef(this.props.listPath);
    // assumption based on current use cases is that we have only one id-only field to select
    this.idOnlyField = this.listDef.children.find(item => item.id_only === true).field_name;
    this.percentageFieldDef = this.listDef.children.find(item => item.percentage === true);
    this.uniqueConstraint = this.listDef.unique_constraint;
    this.uniqueIdCol = this.uniqueConstraint || this.idOnlyField;
    this.noMultipleValues = this.listDef.multiple_values !== true;
    this.noParentChildMixing = this.listDef.tree_collection === true;
    this.optionsPath = `${this.props.listPath}~${this.idOnlyField}`;
    this.setUniqueIdsAndUpdateState(this.props.selectedOptions);
  }

  setUniqueIdsAndUpdateState(values) {
    // set unique ids even if no unique items validation is request, to have unique id for deletion
    values.forEach(value => {
      if (!value.uniqueId) {
        value.uniqueId = Utils.stringToUniqueId(value[this.uniqueIdCol].id);
      }
    });
    this.setState({ values });
  }

  getListValues() {
    return this.state.values.map(value => {
      const simplifiedValue = { uniqueId: value.uniqueId };
      Object.keys(value).forEach(field => {
        let fieldData = value[field];
        if (field === this.idOnlyField && !fieldData.isAFOption) {
          fieldData = new AFOption(value[field]);
        }
        const optionValue = fieldData ? (fieldData[HIERARCHICAL_VALUE] || fieldData.translatedValue) : null;
        if (optionValue) {
          simplifiedValue[field] = optionValue;
          simplifiedValue.id = fieldData.id;
        } else {
          simplifiedValue[field] = fieldData;
        }
      });
      return simplifiedValue;
    });
  }

  dividePercentage() {
    const values = this.state.values;
    const percentage = Math.floor(100 / values.length);
    let percentageLeftover = 100 % values.length;
    values.forEach(item => {
      item[this.percentageFieldDef.field_name] = percentage;
      if (percentageLeftover) {
        item[this.percentageFieldDef.field_name] += 1;
        percentageLeftover -= 1;
      }
    });
    this.handleChange(values);
  }

  handleAddValue(value) {
    const newSelectedOption = {};
    this.listDef.children.forEach(field => {
      if (field.id_only === true) {
        newSelectedOption[this.idOnlyField] = this.props.options.find(o => o.id === value);
      } else {
        newSelectedOption[field.field_name] = null;
      }
    });
    const values = this.state.values.concat(newSelectedOption);
    this.handleChange(values);
  }

  handleRemoveValues(ids) {
    const values = this.state.values.filter(item => !ids.includes(item.uniqueId));
    this.handleChange(values);
  }

  handleEditValue(rowData, colHeader, cellValue) {
    const values = this.state.values;
    const item = values.find(val => val.uniqueId === rowData.uniqueId);
    if (this.percentageFieldDef && this.percentageFieldDef.field_name === colHeader) {
      // percentage validation done by AFList, but the Bootstrap Table widget uses Text Filed (used w/o customization)
      cellValue = Number(cellValue);
    }
    item[colHeader] = cellValue;
    this.handleChange(values);
  }

  handleChange(values) {
    const validationError = this._validateChange(values);
    this.setState({ validationError });
    this.setUniqueIdsAndUpdateState(values);
    this.props.onChange(values);
  }

  _validateChange(values) {
    // TODO mix/max size, parent-child constraints
    let errors = [];
    const { activityValidator } = this.context;
    if (this.percentageFieldDef && values.length) {
      errors.push(activityValidator.totalPercentageValidator(values, this.percentageFieldDef.field_name));
    }
    if (this.uniqueConstraint) {
      errors.push(activityValidator.uniqueValuesValidator(values, this.uniqueConstraint));
    }
    if (this.noMultipleValues) {
      // though UI shouldn't allow, it can be that for some old activities the config was different and allowed it
      errors.push(activityValidator.noMultipleValuesValidator(values, this.idOnlyField));
    }
    if (this.noParentChildMixing) {
      errors.push(activityValidator.noParentChildMixing(values, this.optionsPath, this.idOnlyField));
    }
    errors = errors.filter(error => error !== true && error !== null);

    return errors.length ? errors.join(' ') : null;
  }

  validate() {
    if (this.state.validationError) {
      return 'error';
    }
    return null;
  }

  render() {
    const searchDisplayStyle = this.noMultipleValues && this.state.values.length > 0 ? styles.hidden : styles.inline;
    const btnStyle = `${this.percentageFieldDef ? styles.dividePercentage : styles.hidden} btn btn-success`;
    return (<div >
      <FormGroup controlId={this.props.listPath} validationState={this.validate()} >
        <AFList
          onDeleteRow={this.handleRemoveValues} values={this.getListValues()} listPath={this.props.listPath}
          onEditRow={this.handleEditValue.bind(this)} />
        <FormControl.Feedback />
        <HelpBlock>{this.state.validationError}</HelpBlock>
      </FormGroup>
      <div className={`${searchDisplayStyle} ${styles.searchContainer}`} >
        <AFSearchList onSearchSelect={this.handleAddValue} options={this.props.options} />
        <Button
          onClick={this.dividePercentage.bind(this)} bsStyle="success" bsClass={btnStyle}
          disabled={this.state.values.length === 0} hidden={this.percentageFieldDef === undefined} >
          {translate('Divide Percentage')}
        </Button>
      </div>
    </div>);
  }
}
