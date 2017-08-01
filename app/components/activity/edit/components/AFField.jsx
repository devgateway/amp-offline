import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import AFLabel from './AFLabel';
import AFTextArea from './AFTextArea';
import AFDropDown from './AFDropDown';
import AFOption from './AFOption';
import AFRichTextEditor from './AFRichTextEditor';
import * as Types from './AFComponentTypes';
import styles from '../ActivityForm.css';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import PossibleValuesManager from '../../../../modules/activity/PossibleValuesManager';
import { PATHS_WITH_HIERARCHICAL_VALUES } from '../../../../utils/constants/FieldPathConstants';
import ActivityValidator from '../../../../modules/activity/ActivityValidator';
import LoggerManager from '../../../../modules/util/LoggerManager';
import AFListSelector from './AFListSelector';
import AFNumber from './AFNumber';
import AFDate from './AFDate-AntDesign';

/* eslint-disable class-methods-use-this */

/**
 * Activity Form generic field representation
 * @author Nadejda Mandrescu
 */
class AFField extends Component {
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired,
    isSaveAndSubmit: PropTypes.bool.isRequired
  };

  static propTypes = {
    fieldPath: PropTypes.string.isRequired,
    parent: PropTypes.object.isRequired,
    filter: PropTypes.array,
    showLabel: PropTypes.bool,
    showRequired: PropTypes.bool,
    inline: PropTypes.bool,
    // the component can detect the type automatically or it can be explicitly configured
    type: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    className: PropTypes.string,
    onAfterUpdate: PropTypes.func,
    validationResult: PropTypes.array // eslint-disable-line react/no-unused-prop-types
  };

  static defaultProps = {
    showLabel: true,
    showRequired: true,
    inline: false
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.fieldExists = false;
  }

  componentWillMount() {
    const fieldPathParts = this.props.fieldPath.split('~');
    this.fieldName = fieldPathParts[fieldPathParts.length - 1];
    this.fieldDef = this.context.activityFieldsManager.getFieldDef(this.props.fieldPath);
    this.fieldExists = !!this.fieldDef;
    this.requiredND = this.fieldExists ? this.fieldDef.required === 'ND' : undefined;
    this.alwaysRequired = this.fieldExists ? this.fieldDef.required === 'Y' : undefined;
    this.onChange = this.onChange.bind(this);
    this.componentType = this.props.type || this.getComponentTypeByFieldType();
    this.setState({
      value: this.props.parent[this.fieldName]
    });
    this._processValidation(this.props.parent.errors);
  }

  componentWillReceiveProps(nexProps) {
    if (this.context.isSaveAndSubmit) {
      this.onChange(this.state.value, false);
    } else if (nexProps.validationResult) {
      this._processValidation(this.props.parent.errors);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onAfterUpdate && prevState.value !== this.state.value) {
      this.props.onAfterUpdate(this.state.value);
    }
  }

  onChange(value, asDraft, innerComponentValidationError) {
    this.props.parent[this.fieldName] = value;
    const errors = this.context.activityValidator.validateField(
      this.props.parent, asDraft, this.fieldDef, this.props.fieldPath);
    // TODO check if its still needed to have innerComponentValidationError, additionally to API rules
    this.context.activityValidator.processValidationResult(
      this.props.parent, errors, this.props.fieldPath, innerComponentValidationError);
    this.setState({ value });
    this._processValidation(errors);
  }

  getLabel() {
    const required = (this.requiredND || this.alwaysRequired) && this.props.showRequired === true;
    if (this.props.showLabel === false) {
      if (required) {
        return <span className={styles.required} />;
      }
      return null;
    }
    const label = this.context.activityFieldsManager.getFieldLabelTranslation(this.props.fieldPath);
    return <AFLabel value={label} required={required} className={styles.label_highlight} />;
  }

  getComponentTypeByFieldType() {
    if (!this.fieldDef) {
      return null;
    }
    if (this.fieldDef.id_only === true) {
      return Types.DROPDOWN;
    }
    switch (this.fieldDef.field_type) {
      case 'string':
        // TODO known limitation AMP-25950, until then limiting to text area to allow imports, unless type is explicit
        if (this.fieldDef.field_length) {
          return Types.TEXT_AREA;
        }
        return Types.RICH_TEXT_AREA;
      case 'list':
        return Types.LIST_SELECTOR;
      case 'long':
      case 'float':
        return Types.NUMBER;
      case 'date':
        return Types.DATE;
      default:
        return null;
    }
  }

  getFieldContent() {
    switch (this.componentType) {
      case Types.TEXT_AREA:
        return this._getTextArea();
      case Types.RICH_TEXT_AREA:
        return this._getRichTextEditor();
      case Types.DROPDOWN:
        return this._getDropDown();
      case Types.LIST_SELECTOR:
        return this._getListSelector();
      case Types.NUMBER:
        return this._getNumber();
      case Types.DATE:
        return this._getDate();
      case Types.LABEL:
        return this._getValueAsLabel();
      default:
        return 'Not Implemented';
    }
  }

  _getDropDown() {
    const afOptions = this._toAFOptions(this._getOptions(this.props.fieldPath));
    const selectedId = this.state.value ? this.state.value.id : null;
    return (<AFDropDown
      options={afOptions} onChange={this.onChange} selectedId={selectedId}
      className={this.props.className} />);
  }

  _getListSelector() {
    const optionsFieldName = this.fieldDef.children.find(item => item.id_only === true).field_name;
    const optionsFieldPath = `${this.props.fieldPath}~${optionsFieldName}`;
    let options = this._getOptions(optionsFieldPath);
    if (PATHS_WITH_HIERARCHICAL_VALUES.has(optionsFieldPath)) {
      options = PossibleValuesManager.buildFormattedHierarchicalValues(options);
      options = PossibleValuesManager.fillHierarchicalDepth(options);
    }
    const afOptions = this._toAFOptions(options);
    const selectedOptions = this.state.value;
    return (<AFListSelector
      options={afOptions} selectedOptions={selectedOptions} listPath={this.props.fieldPath}
      onChange={this.onChange} validationError={this.state.validationError} />);
  }

  _getOptions(fieldPath) {
    const options = this.context.activityFieldsManager.possibleValuesMap[fieldPath];
    if (options === null) {
      // TODO throw error but continue to render (?)
      LoggerManager.error(`Options not found for ${this.props.fieldPath}`);
      return [];
    }
    return PossibleValuesManager.setVisibility(options, fieldPath, this.props.filter);
  }

  _toAFOptions(options) {
    return PossibleValuesManager.getTreeSortedOptionsList(options).map(option =>
      (option.visible ? new AFOption(option) : null)).filter(afOption => afOption !== null);
  }

  _getRichTextEditor() {
    return (<AFRichTextEditor
      id={this.props.fieldPath} value={this.state.value} onChange={this.onChange}
      language={this.context.activityFieldsManager._lang || this.context.activityFieldsManager._defaultLang} />);
  }

  _getTextArea() {
    return (<AFTextArea
      value={this.state.value} maxLength={this.fieldDef.field_length} onChange={this.onChange} />);
  }

  _getNumber() {
    return (<AFNumber
      value={this.state.value} onChange={this.onChange} max={this.props.max}
      min={this.props.min} className={this.props.className} />);
  }

  _getDate() {
    return (<AFDate value={this.state.value} onChange={this.onChange} />);
  }

  _getValueAsLabel() {
    let val = '';
    if (this.state.value) {
      val = this.state.value.displayFullValue || this.state.value;
    }
    return <AFLabel value={val} />;
  }

  _getValidationState() {
    if (this.state.validationError) {
      return 'error';
    }
    return null;
  }

  _processValidation(errors) {
    const fieldErrors = errors && errors.filter(e => e.path === this.props.fieldPath);
    const validationError = fieldErrors ? fieldErrors.map(e => e.errorMessage).join(' ') : null;
    this.setState({ validationError });
  }

  render() {
    if (this.fieldExists === false) {
      return null;
    }
    const showValidationError = this.componentType !== Types.LIST_SELECTOR;
    return (
      <FormGroup
        controlId={this.props.fieldPath} validationState={showValidationError ? this._getValidationState() : null}
        className={`${styles.activity_form_control} ${this.props.className}`} >
        <span className={this.props.inline ? styles.inline_field : null}>
          {this.getLabel()}
          {this.getFieldContent()}
        </span>
        <FormControl.Feedback />
        <HelpBlock className={styles.help_block}>{showValidationError && this.state.validationError}</HelpBlock>
      </FormGroup>
    );
  }
}

export default connect(
  state => ({
    validationResult: state.activityReducer.validationResult
  })
)(AFField);
