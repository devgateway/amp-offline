import React, { Component, PropTypes } from 'react';
import { FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import AFLabel from './AFLabel';
import AFTextArea from './AFTextArea';
import AFDropDown from './AFDropDown';
import AFOption from './AFOption';
import AFRichTextEditor from './AFRichTextEditor';
import * as Types from './AFComponentTypes';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

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
    showLabel: PropTypes.bool,
    // the component can detect the type automatically or it can be explicitly configured
    type: PropTypes.string
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  componentWillMount() {
    const fieldPathParts = this.props.fieldPath.split('~');
    this.fieldName = fieldPathParts[fieldPathParts.length - 1];
    this.fieldDef = this.context.activityFieldsManager.getFieldDef(this.props.fieldPath);
    this.forcedType = !!this.props.type;
    this.requiredND = this.fieldDef.required === 'ND';
    this.alwaysRequired = this.fieldDef.required === 'Y';
    this.setState({
      value: this.props.parent[this.fieldName]
    });
  }

  componentWillReceiveProps() {
    if (this.context.isSaveAndSubmit) {
      this.validateIfRequired(this.state.value, false);
    }
  }

  getLabel() {
    if (this.props.showLabel === false) {
      return null;
    }
    const label = this.context.activityFieldsManager.getFieldLabelTranslation(this.props.fieldPath);
    return <AFLabel value={label} required={this.requiredND || this.alwaysRequired}/>;
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
    } else {
      let options = this.context.activityFieldsManager.possibleValuesMap[this.props.fieldPath];
      options = options ? Object.entries(options) : null;
      if (this.type === Types.DROPDOWN || (!this.forcedType && options && options.length > 0)) {
        const selectedId = this.state.value ? this.state.value.id : null;
        const afOptions = options.map(option => new AFOption(option[1]));
        return <AFDropDown options={afOptions} onChange={this.validateIfRequired.bind(this)} selectedId={selectedId}/>;
      }
    }
    return 'Not Implemented';
  }

  _getRichTextEditor() {
    return (<AFRichTextEditor
      id={this.props.fieldPath} value={this.state.value} onChange={this.validateIfRequired.bind(this)}
      language={this.context.activityFieldsManager._lang || this.context.activityFieldsManager._defaultLang} />);
  }

  _getTextArea() {
    return (<AFTextArea
      value={this.state.value} maxLength={this.fieldDef.field_length} onChange={this.validateIfRequired.bind(this)}
    />);
  }

  validate() {
    if (this.state.validationError) {
      return 'error';
    }
    return null;
  }

  validateIfRequired(value, asDraft) {
    let validationError = null;
    const isRequired = this.alwaysRequired || (asDraft === false && this.fieldDef.required === 'ND');
    if (isRequired &&
      (value === null || value === undefined || value === '' || (value.length !== undefined && value.length === 0))) {
      validationError = translate('Field is required!');
    }
    this.props.parent[this.fieldName] = value;
    this.setState({ value, validationError });
  }

  render() {
    return (
      <FormGroup controlId={this.props.fieldPath} validationState={this.validate()} >
        {this.getLabel()}
        {this.getFieldContent()}
        <FormControl.Feedback />
        <HelpBlock>{this.state.validationError}</HelpBlock>
      </FormGroup>
    );
  }
}
