import React, { Component, PropTypes } from 'react';
import styles from '../ActivityPreview.css';
import APField from '../components/APField';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
// import { RICH_TEXT_FIELDS } from '../../../../utils/constants/FieldPathConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Generic activity preview status class
 * @author Anya Marshall
 */
const Status = (ComposedStatus) => class extends Component {
  static propTypes = {
    sectionPath: PropTypes.string,
    groupClass: PropTypes.string,
    fieldNameClass: PropTypes.string,
    fieldValueClass: PropTypes.string
  };

  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityWorkspace: PropTypes.object.isRequired
  };

  static defaultProps = {
    groupClass: styles.section_group_class,
    fieldNameClass: styles.preview_status_title,
    fieldValueClass: styles.preview_status_detail
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
   * @return {null|APField}
   */
  buildSimpleField(path, showIfNotAvailable, NAOptions: Set, inline = false) {
    /* if (this.context.activityFieldsManager.isFieldPathEnabled(path)) {
      const title = this.context.activityFieldsManager.getFieldLabelTranslation(path);
      let value = this.context.activityFieldsManager.getValue(this.context.activity, path);
      value = NAOptions && NAOptions.has(value) ? null : value;
      if (showIfNotAvailable === true || (value !== undefined && value !== null)) {
        const useInnerHTML = RICH_TEXT_FIELDS.has(path);
        return (<APField
          key={path} title={title} value={value} useInnerHTML={useInnerHTML} inline={inline} separator={false}
          fieldNameClass={this.props.fieldNameClass} fieldValueClass={this.props.fieldValueClass} />);
      }
    }*/
    const statuses = { 'AMP ID': this.context.activity.amp_id, Status: 'Ongoing', 'On/Off Budget': 'On Treasury' };
    return (<APField
      key={path} title={path} value={statuses[path]} useInnerHTML={false} inline={inline} separator={false}
      fieldNameClass={this.props.fieldNameClass} fieldValueClass={this.props.fieldValueClass} />);
  }

  render() {
    if (this.props.sectionPath && !this.context.activityFieldsManager.isFieldPathEnabled(this.props.sectionPath)) {
      return null;
    }
    const composedStatus = (<ComposedStatus
      {...this.props} {...this.state} {...this.context} buildSimpleField={this.buildSimpleField.bind(this)} />);

    return (<div className={this.props.groupClass}>
      {composedStatus}
    </div>);
  }
};

export default Status;
