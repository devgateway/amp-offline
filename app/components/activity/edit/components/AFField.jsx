import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { CurrencyRatesManager, FieldPathConstants, FieldsManager, FeatureManager, PossibleValuesManager,
  WorkspaceConstants, ActivityConstants } from 'amp-ui';
import AFLabel from './AFLabel';
import AFInput from './AFInput';
import AFTextArea from './AFTextArea';
import AFDropDown from './AFDropDown';
import AFSearchList from './AFSearchList';
import AFOption from './AFOption';
import AFRichTextEditor from './AFRichTextEditor';
import * as Types from './AFComponentTypes';
import styles from '../ActivityForm.css';
import ActivityValidator from '../../../../modules/field/EntityValidator';
import { reportFieldValidation } from '../../../../actions/ActivityAction';
import Logger from '../../../../modules/util/LoggerManager';
import AFListSelector from './AFListSelector';
import AFNumber from './AFNumber';
import AFDate from './AFDate-AntDesign';
import AFCheckbox from './AFCheckbox';
import AFMultiSelect from './AFMultiSelect';
import translate from '../../../../utils/translate';
import AFRadioBoolean from './AFRadioBoolean';
import AFDateYear from './AFDateYear';
import AFRadioList from './AFRadioList';
import FieldDefinition from '../../../../modules/field/FieldDefinition';
import Messages from '../../../common/Messages';
import PossibleValuesHelper from '../../../../modules/helpers/PossibleValuesHelper';

const logger = new Logger('AF field');

/* eslint-disable class-methods-use-this */

/**
 * Activity Form generic field representation
 * @author Nadejda Mandrescu
 */
class AFField extends Component {
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    currencyRatesManager: PropTypes.instanceOf(CurrencyRatesManager).isRequired,
    activityValidator: PropTypes.instanceOf(ActivityValidator).isRequired,
    validationResult: PropTypes.array,
  };

  static propTypes = {
    fieldPath: PropTypes.string.isRequired,
    parent: PropTypes.object.isRequired,
    id: PropTypes.string,
    // children content used for the CUSTOM field type
    children: PropTypes.any,
    filter: PropTypes.array,
    customLabel: PropTypes.string,
    showLabel: PropTypes.bool,
    showRequired: PropTypes.bool,
    showValidationError: PropTypes.bool,
    inline: PropTypes.bool,
    // the component can detect the type automatically or it can be explicitly configured
    type: PropTypes.string,
    className: PropTypes.string,
    onAfterUpdate: PropTypes.func,
    validationResult: PropTypes.array, // eslint-disable-line react/no-unused-prop-types
    onFieldValidation: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    extraParams: PropTypes.object,
    defaultValueAsEmptyObject: PropTypes.bool,
    forceRequired: PropTypes.bool,
    fmPath: PropTypes.string,
    onBeforeDelete: PropTypes.func,
    calendar: PropTypes.object.isRequired,
    workspacePrefix: PropTypes.string,
  };

  static defaultProps = {
    showLabel: true,
    inline: false,
    showValidationError: true,
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
    this.fieldExists = false;
  }

  componentWillMount() {
    const fieldPathParts = this.props.fieldPath.split('~');
    this.fieldName = fieldPathParts[fieldPathParts.length - 1];
    this.fieldDef = this.context.activityFieldsManager.getFieldDef(this.props.fieldPath);
    this.fieldExists = !!this.fieldDef;
    // Some fields may need a special FM path to check if enabled
    if (this.fieldExists && this.props.fmPath) {
      this.fieldExists = FeatureManager.isFMSettingEnabled(this.props.fmPath);
    }
    this.fieldDef = new FieldDefinition(this.fieldDef);
    this.requiredND = this.fieldExists ? this.fieldDef.isRequiredND() : undefined;
    this.alwaysRequired = this.fieldExists ? this.fieldDef.isAlwaysRequired() : undefined;
    this.onChange = this.onChange.bind(this);
    this.componentType = this.props.type || this.getComponentTypeByFieldType();
    this.setState({
      value: this.props.parent[this.fieldName]
    });
    this._processValidation(this.props.parent.errors);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!this.fieldExists) {
      return;
    }
    if (nextProps.validationResult || nextContext.validationResult) {
      this._processValidation(this.props.parent.errors);
    }
    if (nextProps.parent[this.fieldName] !== this.state.value ||
      nextProps.forceRequired !== this.props.forceRequired) {
      this.onChange(nextProps.parent[this.fieldName], false);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onAfterUpdate && prevState.value !== this.state.value) {
      this.props.onAfterUpdate(this.state.value);
    }
  }

  onChange(value, asDraft, innerComponentValidationError) {
    if (!this.fieldDef.isImportable()) {
      innerComponentValidationError = innerComponentValidationError || translate('editNotAllowed');
      value = this.props.parent[this.fieldName];
    } else {
      this.props.parent[this.fieldName] = value;
    }
    const errors = this.context.activityValidator.validateField(
      this.props.parent, asDraft, this.fieldDef, this.props.fieldPath);
    this.context.activityValidator.processValidationResult(
      this.props.parent, this.props.fieldPath, innerComponentValidationError);
    this.setState({ value });
    this._processValidation(errors, true);
  }

  getLabel() {
    const { showRequired, parent, forceRequired, extraParams } = this.props;
    const { activityValidator } = this.context;
    const toShowRequired = showRequired === undefined ?
      activityValidator.isRequiredDependencyMet(parent, this.fieldDef) : showRequired;
    const required = toShowRequired && (this.requiredND || this.alwaysRequired || forceRequired);
    if (this.props.showLabel === false) {
      if (required) {
        return <span className={styles.required} />;
      }
      return null;
    }
    const { customLabel, fieldPath } = this.props;
    const label = translate(customLabel) || this.context.activityFieldsManager.getFieldLabelTranslation(fieldPath,
      this.props.workspacePrefix);
    return <AFLabel value={label} required={required} className={styles.label_highlight} extraParams={extraParams} />;
  }

  getComponentTypeByFieldType() {
    if (!this.fieldDef) {
      return null;
    }
    if (this.fieldDef.isIdOnly()) {
      return Types.DROPDOWN;
    }
    switch (this.fieldDef.type) {
      case 'string':
        // TODO known limitation AMP-25950, until then limiting to text area to allow imports, unless type is explicit
        if (this.fieldDef.length) {
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
      case 'boolean':
        return Types.CHECKBOX;
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
      case Types.CHECKBOX:
        return this._getCheckbox();
      case Types.RADIO_BOOLEAN:
        return this._getRadioBoolean();
      case Types.RADIO_LIST:
        return this._getRadioList();
      case Types.INPUT_TYPE:
        return this._getInput();
      case Types.MULTI_SELECT:
        return this._getMultiSelect();
      case Types.DATE_YEAR:
        return this._getDateYear();
      case Types.SEARCH:
        return this._getSearch();
      case Types.CUSTOM: {
        return this._getCustom();
      }
      default:
        return 'Not Implemented';
    }
  }

  _getDropDown() {
    const selectedId = this.state.value ? this.state.value.id : null;
    const afOptions = this._toAFOptions(this._getOptions(this.props.fieldPath, selectedId));
    return (<AFDropDown
      options={afOptions} onChange={this.onChange} selectedId={selectedId}
      className={this.props.className} defaultValueAsEmptyObject={this.props.defaultValueAsEmptyObject}
      extraParams={this.props.extraParams} />);
  }

  _getSearch() {
    const { fieldPath, onAfterUpdate, extraParams } = this.props;
    const afOptions = this._toAFOptions(this._getOptions(fieldPath));
    return (<AFSearchList
      onSearchSelect={onAfterUpdate} options={afOptions}
      placeholder={(extraParams && extraParams.placeholder ? extraParams.placeholder : null)} />);
  }

  _getListSelector() {
    if (!this.fieldDef.children.find(item => item.id_only === true)) {
      // TODO: Lists without id_only field will be addressed on AMPOFFLINE-674.
      logger.warn('Not supported (not id_only list.');
      return null;
    }
    const optionsFieldName = this.fieldDef.children.find(item => item.id_only === true).field_name;
    const optionsFieldPath = `${this.props.fieldPath}~${optionsFieldName}`;
    let options = this._getOptions(optionsFieldPath);
    if (FieldPathConstants.PATHS_WITH_HIERARCHICAL_VALUES.has(optionsFieldPath)) {
      options = PossibleValuesManager.buildFormattedHierarchicalValues(options);
      options = PossibleValuesManager.fillHierarchicalDepth(options);
    }
    const afOptions = this._toAFOptions(options);
    const selectedOptions = this.state.value;
    return (<AFListSelector
      options={afOptions} selectedOptions={selectedOptions} listPath={this.props.fieldPath}
      onChange={this.onChange} validationErrors={this.state.validationErrors} extraParams={this.props.extraParams}
      onBeforeDelete={this.props.onBeforeDelete} />);
  }

  _getOptions(fieldPath, selectedId) {
    const { workspacePrefix } = this.props;
    const somePrefix = workspacePrefix || '';
    const options = this.context.activityFieldsManager.possibleValuesMap[fieldPath];
    if (options === null || options === undefined) {
      // TODO throw error but continue to render (?)
      logger.error(`Options not found for ${this.props.fieldPath}`);
      return [];
    }
    let optionsWithPrefix = { };
    if (Object.keys(options).filter(o => options[o][ActivityConstants.EXTRA_INFO]
      && options[o][ActivityConstants.EXTRA_INFO][WorkspaceConstants.PREFIX_FIELD] === somePrefix)) {
      Object.keys(options).forEach(o => {
        if (options[o][ActivityConstants.EXTRA_INFO] &&
          options[o][ActivityConstants.EXTRA_INFO][WorkspaceConstants.PREFIX_FIELD] === somePrefix) {
          optionsWithPrefix[o] = options[o];
        }
      });
    }
    if (Object.keys(optionsWithPrefix).length === 0) {
      optionsWithPrefix = options;
    }
    const isORFilter = (this.props.extraParams && this.props.extraParams.isORFilter) || false;
    return PossibleValuesManager.setVisibility(
      optionsWithPrefix, fieldPath, this.context.currencyRatesManager, this.props.filter, isORFilter, selectedId);
  }

  _toAFOptions(options) {
    const { afOptionFormatter, sortByDisplayValue } = this.props.extraParams || {};
    const afOptions = PossibleValuesManager.getTreeSortedOptionsList(options, PossibleValuesHelper.reverseSortOptions)
      .map(option =>
      (option.visible ? this._toAFOption(option, afOptionFormatter) : null)).filter(afOption => afOption !== null);
    if (sortByDisplayValue) {
      AFOption.sortByDisplayValue(afOptions);
    }
    return afOptions;
  }

  _toAFOption(option, afOptionFormatter) {
    const afOption = new AFOption(option);
    afOption.valueFormatter = afOptionFormatter;
    return afOption;
  }

  _getRichTextEditor() {
    return (<AFRichTextEditor
      id={this.props.fieldPath} value={this.state.value} onChange={this.onChange}
      language={this.context.activityFieldsManager._lang || this.context.activityFieldsManager._defaultLang} />);
  }

  _getTextArea() {
    return (
      <AFTextArea
        value={this.state.value} maxLength={this.fieldDef.length} onChange={this.onChange}
        readonly={!this.fieldDef.isImportable()} />
    );
  }

  _getInput() {
    return (
      <AFInput
        value={this.state.value} maxLength={this.fieldDef.length} onChange={this.onChange}
        readonly={!this.fieldDef.isImportable()} />
    );
  }

  _getNumber() {
    return (<AFNumber
      value={this.state.value} onChange={this.onChange}
      extraParams={this.props.extraParams}
      className={this.props.className} />);
  }

  _getDate() {
    return (<AFDate value={this.state.value} onChange={this.onChange} extraParams={this.props.extraParams} />);
  }

  _getDateYear() {
    const extraParams = this.props.extraParams || {};
    const options = Array(extraParams.range).fill().map((_, i) => i + extraParams.startYear);
    return (<AFDateYear
      value={this.state.value} onChange={this.onChange} extraParams={extraParams} options={options}
      calendar={this.props.calendar} />);
  }

  _getCheckbox() {
    return (<AFCheckbox value={this.state.value} onChange={this.onChange} />);
  }

  _getRadioBoolean() {
    return <AFRadioBoolean value={this.state.value} onChange={this.onChange} />;
  }

  _getRadioList() {
    const selectedId = this.state.value ? this.state.value.id : null;
    const afOptions = this._toAFOptions(this._getOptions(this.props.fieldPath, selectedId));
    return <AFRadioList value={this.state.value} onChange={this.onChange} options={afOptions} />;
  }

  _getMultiSelect() {
    let selectFieldDef = this.fieldDef;
    let optionsPath = this.props.fieldPath;
    if (this.fieldDef.hasChildren()) {
      selectFieldDef = this.fieldDef.children.length === 1 ?
        this.fieldDef.children[0] : this.fieldDef.children.find(f => f.id_only === true);
      selectFieldDef = selectFieldDef && new FieldDefinition(selectFieldDef);
      if (!selectFieldDef) {
        logger.error('Could not automatically detect multi-select field.');
        return null;
      }
      optionsPath = `${this.props.fieldPath}~${selectFieldDef.name}`;
    }
    const afOptions = this._toAFOptions(this._getOptions(optionsPath));
    return (<AFMultiSelect
      options={afOptions} values={this.state.value} listPath={this.props.fieldPath}
      selectField={selectFieldDef.name} onChange={this.onChange} />);
  }

  _getCustom() {
    const { children } = this.props;
    const isArray = Array.isArray(children);
    let cs = (isArray ? children : [children]).filter(child => child);
    cs = React.Children.map(cs, child => React.cloneElement(child, { onChange: this.onChange }));
    return cs;
  }

  _getValueAsLabel() {
    let val = '';
    if (this.state.value) {
      val = this.state.value.displayFullValue || this.state.value.value || this.state.value;
    }
    return <AFLabel value={val} extraParams={this.props.extraParams} />;
  }

  _isFullyInitialized() {
    return !!this.context.activityFieldsManager;
  }

  _getValidationState() {
    if (this.state.validationErrors) {
      return 'error';
    }
    return null;
  }

  _processValidation(errors, isNotifyFieldValidation) {
    const errorMessages = errors && errors.filter(e => e.path === this.props.fieldPath).map(e => e.errorMessage);
    const validationErrors = errorMessages && errorMessages.length ? errorMessages : null;
    if (isNotifyFieldValidation) {
      this.props.onFieldValidation(this.props.fieldPath, errors);
    }
    this.setState({ validationErrors });
  }

  render() {
    if (this.fieldExists === false || !this._isFullyInitialized()) {
      return null;
    }
    const showValidationError = this.props.showValidationError && !(this.componentType === Types.LIST_SELECTOR ||
      (this.componentType === Types.LABEL && !this.props.showLabel));
    return (
      <FormGroup
        controlId={this.props.fieldPath} validationState={showValidationError ? this._getValidationState() : null}
        className={`${styles.activity_form_control} ${this.props.className}`} id={this.props.id}>
        <span className={this.props.inline ? styles.inline_field : null}>
          {this.getLabel()}
          {this.getFieldContent()}
        </span>
        <FormControl.Feedback />
        <HelpBlock className={styles.help_block}>
          {showValidationError && <Messages messages={this.state.validationErrors} />}
        </HelpBlock>
      </FormGroup>
    );
  }
}

export default connect(
  state => ({
    validationResult: state.activityReducer.validationResult,
    lang: state.translationReducer.lang,
    calendar: state.startUpReducer.calendar,
    workspacePrefix: state.workspaceReducer.currentWorkspace[WorkspaceConstants.PREFIX_FIELD]
  }),
  dispatch => ({
    onFieldValidation: (fieldPath, errors) => dispatch(reportFieldValidation({ fieldPath, errors }))
  })
)(AFField);
