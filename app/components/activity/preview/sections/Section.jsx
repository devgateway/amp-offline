import React, { Component, PropTypes } from 'react';
import APField from '../components/APField';
import styles from '../ActivityPreview.css';
import ActivityFieldsManager from '../../../../modules/activity/ActivityFieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import { RICH_TEXT_FIELDS } from '../../../../utils/constants/FieldPathConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Generic activity preview section class
 * @author Nadejda Mandrescu
 */
const Section = (ComposedSection, SectionTitle = null, useEncapsulateHeader = true) => class extends Component {
  static propTypes = {
    titleDetails: PropTypes.arrayOf(PropTypes.string, PropTypes.object)
  };

  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired,
    activityWorkspace: PropTypes.object.isRequired
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
   * @return {null|APField}
   */
  buildSimpleField(path, showIfNotAvailable, NAOptions: Set) {
    if (this.context.activityFieldsManager.isFieldPathEnabled(path)) {
      const title = this.context.activityFieldsManager.getFieldLabelTranslation(path);
      let value = this.context.activityFieldsManager.getValue(this.context.activity, path);
      value = NAOptions && NAOptions.has(value) ? null : value;
      if (showIfNotAvailable === true || (value !== undefined && value !== null)) {
        const useInnerHTML = RICH_TEXT_FIELDS.has(path);
        return <APField key={path} title={title} value={value} useInnerHTML={useInnerHTML} />;
      }
    }
  }

  render() {
    const composedSection = (<ComposedSection
      {...this.props} {...this.state} {...this.context} buildSimpleField={this.buildSimpleField.bind(this)} />);
    if (useEncapsulateHeader === false) {
      return composedSection;
    }
    return (<div key={SectionTitle} className={styles.section_group}>
      <div className={styles.section_title}>
        <span>{translate(SectionTitle)} </span><span>{this.props.titleDetails}</span>
      </div>
      {composedSection}
    </div>);
  }
};

export default Section;
