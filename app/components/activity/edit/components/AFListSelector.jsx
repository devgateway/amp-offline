import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
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
    this.idOnlyField = this.listDef.children.find(item =>
    item.id_only === true).field_name;
    this.setState({
      values: this.props.selectedOptions
    });
  }

  getListValues() {
    return this.state.values.map(value => {
      const simplifiedValue = {};
      Object.keys(value).forEach(field => {
        const optionValue = value[field] ? (value[field][HIERARCHICAL_VALUE] || value[field].value) : null;
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
    // TODO divide
    // TODO check if it is possible to save when percentage sum is not consistent
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
    this.setState({ values });
  }

  handleRemoveValues(ids) {
    // TODO check constraints
    const values = this.state.values.filter(item => ids.includes(item[this.idOnlyField].id) === false);
    this.setState({
      values
    });
    this.props.onChange(values);
  }

  handleChange() {
    // TODO constraints validation
    this.props.onChange(this.state.value);
  }

  render() {
    const btnStyle = `${styles.dividePercentage} btn btn-success`;
    return (<div >
      <AFList
        onDeleteRow={this.handleRemoveValues} values={this.getListValues()} listPath={this.props.listPath}
        activityFieldsManager={this.props.activityFieldsManager} />
      <div className={`${styles.inline} ${styles.searchContainer}`} >
        <AFSearchList onSearchSelect={this.handleAddValue} options={this.props.options} />
        <Button onClick={this.dividePercentage.bind(this)} bsStyle="success" bsClass={btnStyle} >
          {translate('Divide Percentage')}
        </Button>
      </div>
    </div>);
  }
}
