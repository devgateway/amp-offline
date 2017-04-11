import React from 'react';
import Section from './Section';
import InternalIdsFromIdentificationSection from './InternalIdsFromIdentificationSection';
import * as AC from '../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../modules/util/LoggerManager';

/**
 * Identification section
 * @author Nadejda Mandrescu
 */
export default class IdentificationSection extends Section {

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this._sectionName = 'Identification';
  }

  get sectionName() {
    return this._sectionName;
  }

  buildContent() {
    // [field path, (optional, default true) display if empty]
    const fieldPaths = [AC.PROJECT_TITLE, AC.AMP_ID, AC.ACTIVITY_STATUS, AC.STATUS_REASON, AC.OBJECTIVE, AC.DESCRIPTION,
      AC.PROJECT_COMMENTS, AC.LESSONS_LEARNED, AC.PROJECT_IMPACT, AC.ACTIVITY_SUMMARY, AC.CONDITIONALITIES,
      AC.PROJECT_MANAGEMENT, AC.A_C_CHAPTER];
    const showIfNotAvailable = new Set([AC.PROJECT_TITLE, AC.AMP_ID, AC.ACTIVITY_STATUS]);
    const content = fieldPaths.map(fieldPath => this.buildSimpleField(fieldPath, showIfNotAvailable.has(fieldPath)))
      .filter(data => data !== undefined);
    content.push(<InternalIdsFromIdentificationSection key="InternalIdsFromIdentificationSection" />);
    return content;
  }

}
