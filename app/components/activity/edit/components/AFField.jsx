import React, { Component, PropTypes } from 'react';
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
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import AFListSelector from './AFListSelector';
import AFNumber from './AFNumber';
import AFDate from './AFDate';

/* eslint-disable class-methods-use-this */

/**
 * Activity Form generic field representation
 * @author Nadejda Mandrescu
 */
export default class AFField extends Component {
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    isSaveAndSubmit: PropTypes.bool.isRequired
  };

  static propTypes = {
    fieldPath: PropTypes.string.isRequired,
    parent: PropTypes.object.isRequired,
    filter: PropTypes.array,
    showLabel: PropTypes.bool,
    // the component can detect the type automatically or it can be explicitly configured
    type: PropTypes.string,
    onAfterUpdate: PropTypes.func,
    max: PropTypes.number,
    min: PropTypes.number,
    showValueAsLabel: PropTypes.bool,
    className: PropTypes.string
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
    this.forcedType = !!this.props.type;
    this.requiredND = this.fieldExists ? this.fieldDef.required === 'ND' : undefined;
    this.alwaysRequired = this.fieldExists ? this.fieldDef.required === 'Y' : undefined;
    this.validateIfRequired = this.validateIfRequired.bind(this);
    this.setState({
      value: this.props.parent[this.fieldName]
    });
  }

  componentWillReceiveProps() {
    if (this.context.isSaveAndSubmit) {
      this.validateIfRequired(this.state.value, false);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onAfterUpdate && prevState.value !== this.state.value) {
      this.props.onAfterUpdate();
    }
  }

  getLabel() {
    if (this.props.showLabel === false) {
      return null;
    }
    const label = this.context.activityFieldsManager.getFieldLabelTranslation(this.props.fieldPath);
    return <AFLabel value={label} required={this.requiredND || this.alwaysRequired} />;
  }

  getFieldContent() {
    if (this.props.type === Types.TEXT_AREA || (!this.forcedType && this.fieldDef.field_type === 'string')) {
      // TODO known limitation AMP-25950, so until then limiting to text area to allow imports, unless type is explicit
      if (this.fieldDef.field_length) {
        return this._getTextArea();
      } else {
        return this._getRichTextEditor();
      }
    } else if (this.props.type === Types.RICH_TEXT_AREA) {
      return this._getRichTextEditor();
    } else if (this.type === Types.DROPDOWN || (!this.forcedType && this.fieldDef.id_only === true)
      || this.props.type === Types.DROPDOWN) {
      return this._getDropDown();
    } else if (this.type === Types.LIST_SELECTOR || (!this.forcedType && this.fieldDef.field_type === 'list')) {
      return this._getListSelector();
    } else if (this.props.type === Types.NUMBER) {
      return this._getNumber();
    } else if (this.props.type === Types.DATE) {
      return this._getDate();
    }
    return 'Not Implemented';
  }

  _getDropDown() {
    const afOptions = this._toAFOptions(this._getOptions(this.props.fieldPath));
    const selectedId = this.state.value ? this.state.value.id : null;
    return (<AFDropDown
      options={afOptions} onChange={this.validateIfRequired} selectedId={selectedId}
      showValueAsLabel={this.props.showValueAsLabel} className={this.props.className} />);
  }

  _getListSelector() {
    const optionsFieldName = this.fieldDef.children.find(item => item.id_only === true).field_name;
    const optionsFieldPath = `${this.props.fieldPath}~${optionsFieldName}`;
    let options = this._getOptions(optionsFieldPath);
    options = PossibleValuesManager.buildFormattedHierarchicalValues(options);
    const afOptions = this._toAFOptions(PossibleValuesManager.fillHierarchicalDepth(options));
    const selectedOptions = this.state.value;
    return (<AFListSelector
      options={afOptions} selectedOptions={selectedOptions} activityFieldsManager={this.context.activityFieldsManager}
      listPath={this.props.fieldPath} onChange={this.validateIfRequired} />);
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
    return PossibleValuesManager.getTreeSortedOptionsList(options).map(option => {
      const afOption = option.visible ? new AFOption(option) : null;
      if (afOption) {
        afOption.value = PossibleValuesManager.getOptionTranslation(option);
      }
      return afOption;
    }).filter(afOption => afOption !== null);
  }

  _getRichTextEditor() {
    return (<AFRichTextEditor
      id={this.props.fieldPath} value={this.state.value} onChange={this.validateIfRequired}
      language={this.context.activityFieldsManager._lang || this.context.activityFieldsManager._defaultLang}
      showValueAsLabel={this.props.showValueAsLabel} />);
  }

  _getTextArea() {
    return (<AFTextArea
      value={this.state.value} maxLength={this.fieldDef.field_length} onChange={this.validateIfRequired}
      showValueAsLabel={this.props.showValueAsLabel}
    />);
  }

  _getNumber() {
    return (<AFNumber
      value={this.state.value} onChange={this.validateIfRequired} max={this.props.max}
      min={this.props.min} className={this.props.className} showValueAsLabel={this.props.showValueAsLabel} />);
  }

  _getDate() {
    return (<AFDate value={this.state.value} onChange={this.validateIfRequired} />);
  }

  validate() {
    if (this.state.validationError) {
      return 'error';
    }
    return null;
  }

  validateIfRequired(value, asDraft, innerComponentValidationError) {
    let validationError = innerComponentValidationError;
    const isRequired = this.alwaysRequired || (asDraft === false && this.fieldDef.required === 'ND');
    if (isRequired &&
      (value === null || value === undefined || value === '' || (value.length !== undefined && value.length === 0))) {
      validationError = translate('requiredField');
    }
    this.props.parent[this.fieldName] = value;
    this.setState({ value, validationError });
  }

  render() {
    if (this.fieldExists === false) {
      return null;
    }
    return (
      <FormGroup
        controlId={this.props.fieldPath} validationState={this.validate()}
        className={`${styles.activity_form_control} ${this.props.className}`} >
        {this.getLabel()}
        {this.getFieldContent()}
        <FormControl.Feedback />
        <HelpBlock>{this.state.validationError}</HelpBlock>
      </FormGroup>
    );
  }
}
