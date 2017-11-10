import React, { Component, PropTypes } from 'react';
import styles from '../ActivityPreview.css';
import APField from '../components/APField';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import FeatureManager from '../../../../modules/util/FeatureManager';
import {
  ACTIVITY_FIELDS_FM_PATH,
  ALTERNATE_VALUE_PATH,
  RICH_TEXT_FIELDS
} from '../../../../utils/constants/FieldPathConstants';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';
import DateUtils from '../../../../utils/DateUtils';

const logger = new Logger('AP section');

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
    fieldValueClass: PropTypes.string,
    fmPath: PropTypes.string,
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
    logger.log('constructor');
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
    const fmPath = ACTIVITY_FIELDS_FM_PATH[path];
    if (this.context.activityFieldsManager.isFieldPathEnabled(path)
      && (!fmPath || FeatureManager.isFMSettingEnabled(fmPath, false))) {
      const title = this.context.activityFieldsManager.getFieldLabelTranslation(path);
      let valuePath = path;
      if (parent) {
        const fieldPathParts = path.split('~');
        valuePath = fieldPathParts[fieldPathParts.length - 1];
      }
      const alternatePath = ALTERNATE_VALUE_PATH[valuePath];
      let value = this.context.activityFieldsManager.getValue(parent || this.context.activity, valuePath);
      if ((value === null || value === undefined) && alternatePath) {
        value = this.context.activityFieldsManager.getValue(this.context.activity, alternatePath);
      }
      const fieldDef = this.context.activityFieldsManager.getFieldDef(path);
      if (fieldDef.field_type === 'date') {
        value = DateUtils.createFormattedDate(value);
      }
      value = NAOptions && NAOptions.has(value) ? null : value;

      const re = /^\s?$/; // check for whitespace
      if (re.test(value)) value = value.trim(); // check for whitespace
      if (value === '' || value === null) {
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
    if (this.props.fmPath && !FeatureManager.isFMSettingEnabled(this.props.fmPath)) {
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
