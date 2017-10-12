import React, { Component, PropTypes } from 'react';
import { Button, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import styles from './AFListSelector.css';
import AFList from './AFList';
import AFSearchList from './AFSearchList';
import AFOption from './AFOption';
import AFLabel from './AFLabel';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityValidator from '../../../../modules/activity/ActivityValidator';
import * as AC from '../../../../utils/constants/ActivityConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import * as Utils from '../../../../utils/Utils';

/* eslint-disable class-methods-use-this */

/** Explicit definition of the search field label parts (instead of automatic detection), e.g. when plural is used */
const fieldNameToSearchFieldLabel = {};
fieldNameToSearchFieldLabel[AC.ORGANIZATION] = 'Search Organizations';
fieldNameToSearchFieldLabel[AC.LOCATION] = 'Search Locations';
fieldNameToSearchFieldLabel[AC.PROGRAM] = 'Add Program';

/**
 * Activity Form List options selection, with possibility to add percentage and additional element input text
 * @author Nadejda Mandrescu
 */
export default class AFListSelector extends Component {
  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired
  };

  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.instanceOf(AFOption)).isRequired,
    selectedOptions: PropTypes.array,
    listPath: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    // we need to report validation error before search box, thus passing to the component to display
    validationError: PropTypes.string,
    extraParams: PropTypes.object
  };

  constructor(props) {
    super(props);
    LoggerManager.debug('constructor');
    this.handleAddValue = this.handleAddValue.bind(this);
    this.handleRemoveValue = this.handleRemoveValue.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.dividePercentage = this.dividePercentage.bind(this);
    this.state = {
      values: []
    };
  }

  componentWillMount() {
    this.listDef = this.context.activityFieldsManager.getFieldDef(this.props.listPath);
    // assumption based on current use cases is that we have only one id-only field to select
    this.idOnlyField = this.listDef.children.find(item => item.id_only === true).field_name;
    this.searchLabel = fieldNameToSearchFieldLabel[this.idOnlyField]
      || `Search ${AC.toOriginalLabel(this.idOnlyField)}`;
    this.percentageFieldDef = this.listDef.children.find(item => item.percentage === true);
    this.uniqueIdCol = this.uniqueConstraint || this.idOnlyField;
    this.setUniqueIdsAndUpdateState(this.props.selectedOptions || []);
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
    this.state.values.forEach(value => {
      const idOnlyFieldValue = value[this.idOnlyField];
      if (!idOnlyFieldValue.isAFOption) {
        value[this.idOnlyField] = new AFOption({ ...idOnlyFieldValue, displayHierarchicalValue: true });
      }
    });
    return this.state.values;
  }

  dividePercentage() {
    let values = this.state.values;
    const percentage = Math.floor(100 / values.length);
    let percentageLeftover = 100 % values.length;
    // using .map to generate new values that trigger the list component refresh
    values = values.map(item => {
      item[this.percentageFieldDef.field_name] = percentage;
      if (percentageLeftover) {
        item[this.percentageFieldDef.field_name] += 1;
        percentageLeftover -= 1;
      }
      return item;
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

  handleRemoveValue(id) {
    const values = this.state.values.filter(item => id !== item.uniqueId);
    this.handleChange(values);
  }

  handleEditValue(rowData, colHeader, cellValue) {
    const values = this.state.values;
    const item = values.find(val => val.uniqueId === rowData.uniqueId);
    item[colHeader] = cellValue;
    this.handleChange(values);
  }

  handleChange(values) {
    this.setUniqueIdsAndUpdateState(values);
    this.props.onChange(values);
  }

  _getValidationState() {
    if (this.props.validationError) {
      return 'error';
    }
    return null;
  }

  _renderTable() {
    const params = this.props.extraParams || {};
    if (params['no-table'] !== true) {
      return (<div>
        <div>
          <AFLabel value={translate(this.searchLabel)} />
        </div>
        <AFList
          onDeleteRow={this.handleRemoveValue} values={this.getListValues()} listPath={this.props.listPath}
          onEditRow={this.handleEditValue.bind(this)} language={this.context.activityFieldsManager._lang} />
        <FormGroup controlId={this.props.listPath} validationState={this._getValidationState()}>
          <FormControl.Feedback />
          <HelpBlock>{this.props.validationError}</HelpBlock>
        </FormGroup>
      </div>);
    }
  }

  render() {
    const searchDisplayStyle = this.noMultipleValues && this.state.values.length > 0 ? styles.hidden : styles.inline;
    const btnStyle = `${this.percentageFieldDef ? styles.dividePercentage : styles.hidden} btn btn-success`;
    return (<div>
      {this._renderTable()}
      <div className={`${searchDisplayStyle} ${styles.searchContainer}`}>
        <AFSearchList onSearchSelect={this.handleAddValue} options={this.props.options} />
        <Button
          onClick={this.dividePercentage.bind(this)} bsStyle="success" bsClass={btnStyle}
          disabled={this.state.values.length === 0} hidden={this.percentageFieldDef === undefined}>
          {translate('Divide Percentage')}
        </Button>
      </div>
    </div>);
  }
}
