import React, { Component, PropTypes } from 'react';
import styles from './ActivityPreview.css';
import FundingSummary from './sections/FundingSummary';
import AdditionalInfo from './sections/AdditionalInfo';
import LoggerManager from '../../../modules/util/LoggerManager';

/**
 * Activty summary information
 * @author Nadejda Mandrescu
 */
export default class SummaryGroup extends Component {

  static contextTypes = {
    currentWorkspaceSettings: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const currency = this.context.currentWorkspaceSettings.currency;
    return (<div className={styles.summary_container}>
      <FundingSummary
        titleDetails={currency}
        titleClass={styles.summary_section_title}
        groupClass={styles.summary_section_group}
        fieldNameClass={styles.summary_field_name}
        fieldValueClass={styles.summary_field_value} />
      <AdditionalInfo
        titleClass={styles.summary_section_title}
        groupClass={styles.summary_section_group}
        fieldNameClass={styles.summary_field_name}
        fieldValueClass={styles.summary_field_value} />
    </div>);
  }

}
