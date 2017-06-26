import React, { Component, PropTypes } from 'react';
import { Button, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import styles from './AFListSelector.css';
import AFList from './AFList';
import AFSearchList from './AFSearchList';
import AFOption from './AFOption';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import { HIERARCHICAL_VALUE } from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * Activity Form List options selection, with possibility to add percentage and additional element input text
 * @author Nadejda Mandrescu
 */
export default class AFListSelector extends Component {
  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.instanceOf(AFOption)).isRequired,
    selectedOptions: PropTypes.array.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
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
      values: []
    };
  }

  componentWillMount() {
    this.listDef = this.props.activityFieldsManager.getFieldDef(this.props.listPath);
    // assumption based on current use cases is that we have only one id-only field to select
    this.idOnlyField = this.listDef.children.find(item => item.id_only === true).field_name;
    this.percentageFieldDef = this.listDef.children.find(item => item.percentage === true);
    this.setState({
      values: this.props.selectedOptions,
      validationError: null
    });
  }

  getListValues() {
    return this.state.values.map(value => {
      const simplifiedValue = {};
      Object.keys(value).forEach(field => {
        const optionValue = value[field] ? (value[field][HIERARCHICAL_VALUE] || value[field].translatedValue) : null;
        if (optionValue) {
          simplifiedValue[field] = optionValue;
          simplifiedValue.id = value[field].id;
        } else {
          simplifiedValue[field] = value[field];
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
    });
    for (let idx = 0; percentageLeftover > 0; idx++, percentageLeftover--) { // eslint-disable-line no-plusplus
      values[idx][this.percentageFieldDef.field_name] += 1;
    }
    this.handleChange(values);
  }

  handleAddValue(value) {
    // TODO check constraints
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
    const values = this.state.values.filter(item => ids.includes(item[this.idOnlyField].id) === false);
    this.handleChange(values);
  }

  handleEditValue(rowData, colHeader, cellValue) {
    const values = this.state.values;
    const item = values.find(val => val[this.idOnlyField].id === rowData.id);
    if (this.percentageFieldDef && this.percentageFieldDef.field_name === colHeader) {
      // percentage validation done by AFList, but the Bootstrap Table widget uses Text Filed (used w/o customization)
      cellValue = Number(cellValue);
    }
    item[colHeader] = cellValue;
    this.handleChange(values);
  }

  handleChange(values) {
    // TODO check constraints
    // TODO constraints validation
    const errors = [];
    const totalPercentage = this.percentageFieldDef && values.length ?
      this.props.activityFieldsManager.totalPercentageValidator(values, this.percentageFieldDef.field_name) : null;
    if (totalPercentage !== null && totalPercentage !== true) {
      errors.push(totalPercentage);
    }
    this.setState({
      values,
      validationError: errors.length ? errors.join(' ') : null
    });
    this.props.onChange(values);
  }

  validate() {
    if (this.state.validationError) {
      return 'error';
    }
    return null;
  }

  render() {
    const btnStyle = `${styles.dividePercentage} btn btn-success`;
    return (<div >
      <FormGroup controlId={this.props.listPath} validationState={this.validate()} >
        <AFList
          onDeleteRow={this.handleRemoveValues} values={this.getListValues()} listPath={this.props.listPath}
          activityFieldsManager={this.props.activityFieldsManager} onEditRow={this.handleEditValue.bind(this)} />
        <FormControl.Feedback />
        <HelpBlock>{this.state.validationError}</HelpBlock>
      </FormGroup>
      <div className={`${styles.inline} ${styles.searchContainer}`} >
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
