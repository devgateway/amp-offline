import React, { Component, PropTypes } from 'react';
import styles from '../ActivityPreview.css';
import APField from '../components/APField';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import { RICH_TEXT_FIELDS } from '../../../../utils/constants/FieldPathConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';
import DateUtils from '../../../../utils/DateUtils';

/**
 * Generic activity preview section class
 * @author Nadejda Mandrescu
 */
const Section = (ComposedSection, SectionTitle = null, useEncapsulateHeader = true, sID) => class extends Component {
  static propTypes = {
    titleDetails: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    sectionPath: PropTypes.string,
    titleClass: PropTypes.string,
    groupClass: PropTypes.string,
    composedClass: PropTypes.string,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string
  };

  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired,
    activityWorkspace: PropTypes.object.isRequired
  };

  static defaultProps = {
    titleClass: styles.section_title_class,
    groupClass: styles.section_group_class,
    fieldNameClass: styles.section_field_name,
    fieldValueClass: styles.section_field_value
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  /**
   * Renders field data if it is enabled in FM. If renabled, but value is not available, then it will not be rendered,
   * unless it is requested via showIfNotAvailable flag.
   * @param path field path
   * @param showIfNotAvailable flag to forcibly display the field when no value is provided
   * @param NAOptions optional set of values that should be treated as undefined
   * @param inline optional flag to render name and values on the same line
   * @param parent optional object where we look for the path (instead of the activity root).
   * @return {null|APField}
   */
  buildSimpleField(path, showIfNotAvailable, NAOptions: Set, inline = false, parent = null) {
    if (this.context.activityFieldsManager.isFieldPathEnabled(path)) {
      const title = this.context.activityFieldsManager.getFieldLabelTranslation(path);
      let valuePath = path;
      if (parent) {
        const fieldPathParts = path.split('~');
        valuePath = fieldPathParts[fieldPathParts.length - 1];
      }
      let value = this.context.activityFieldsManager.getValue(parent || this.context.activity, valuePath);
      const fieldDef = this.context.activityFieldsManager.getFieldDef(path);
      if (fieldDef.field_type === 'date') {
        value = DateUtils.createFormattedDate(value);
      }
      value = NAOptions && NAOptions.has(value) ? null : value;
      if (value === ' ' || value === null) {
        value = translate('No Data');
      }
      if (showIfNotAvailable === true || (value !== undefined && value !== null)) {
        const useInnerHTML = RICH_TEXT_FIELDS.has(path);
        return (<APField
          key={path} title={title} value={value} useInnerHTML={useInnerHTML} inline={inline} separator={false}
          fieldNameClass={this.props.fieldNameClass} fieldValueClass={this.props.fieldValueClass} />);
      }
    }
  }

  render() {
    if (this.props.sectionPath && !this.context.activityFieldsManager.isFieldPathEnabled(this.props.sectionPath)) {
      return null;
    }
    const composedSection = (<ComposedSection
      {...this.props} {...this.state} {...this.context} buildSimpleField={this.buildSimpleField.bind(this)} />);
    if (useEncapsulateHeader === false) {
      return composedSection;
    }
    // TODO iteration 2+ section toggle (TDC based on desgin + VG)
    return (<div key={SectionTitle} className={this.props.groupClass} id={sID}>
      <div className={this.props.titleClass}>
        <span>{translate(SectionTitle)} </span><span>{this.props.titleDetails}</span>
      </div>
      <div className={this.props.composedClass}>
        {composedSection}
      </div>
    </div>);
  }
};

export default Section;
