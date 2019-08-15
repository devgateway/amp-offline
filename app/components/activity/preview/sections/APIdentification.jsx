import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, ValueConstants, FieldsManager, Section } from 'amp-ui';
import translate from '../../../../utils/translate';
import Utils from '../../../../utils/Utils';
import DateUtils from '../../../../utils/DateUtils';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP Identification');

/**
 * Identification section
 * @author Nadejda Mandrescu
 */
class APIdentification extends Component {
  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  render() {
    const { buildSimpleField } = this.props;
    const fieldPaths = [ActivityConstants.STATUS_REASON, ActivityConstants.TYPE_OF_COOPERATION,
      ActivityConstants.TYPE_OF_IMPLEMENTATION, ActivityConstants.MODALITIES, ActivityConstants.OBJECTIVE,
      ActivityConstants.DESCRIPTION, ActivityConstants.PROJECT_COMMENTS, ActivityConstants.RESULTS,
      ActivityConstants.LESSONS_LEARNED, ActivityConstants.PROJECT_IMPACT, ActivityConstants.ACTIVITY_SUMMARY,
      ActivityConstants.CONDITIONALITIES, ActivityConstants.PROJECT_MANAGEMENT,
      ActivityConstants.BUDGET_CODE_PROJECT_ID, ActivityConstants.A_C_CHAPTER, ActivityConstants.CRIS_NUMBER,
      ActivityConstants.ACTIVITY_BUDGET, ActivityConstants.GOVERNMENT_AGREEMENT_NUMBER,
      ActivityConstants.GOVERNMENT_APPROVAL_PROCEDURES, ActivityConstants.JOINT_CRITERIA,
      ActivityConstants.HUMANITARIAN_AID];
    // Show budget extras fields like ministry_code, etc only when activity_budget is enabled and has value 'On Budget'.
    if (this.props.activityFieldsManager.isFieldPathEnabled(ActivityConstants.ACTIVITY_BUDGET)
      && this.props.activity[ActivityConstants.ACTIVITY_BUDGET]
      && this.props.activity[ActivityConstants.ACTIVITY_BUDGET].value === ValueConstants.ON_BUDGET) {
      fieldPaths.push(ActivityConstants.INDIRECT_ON_BUDGET);
      fieldPaths.push(ActivityConstants.FY);
      fieldPaths.push(ActivityConstants.MINISTRY_CODE);
      fieldPaths.push(ActivityConstants.PROJECT_CODE);
    }
    fieldPaths.push(...[ActivityConstants.FINANCIAL_INSTRUMENT, ActivityConstants.IATI_IDENTIFIER]);
    return (
      <div>
        {fieldPaths.map(fieldPath => buildSimpleField(fieldPath, true))}
      </div>
    );
  }
}

export default Section(APIdentification, { SectionTitle: 'Identification',
  useEncapsulateHeader: true,
  sID: 'APIdentification',
  Logger,
  translate,
  DateUtils,
  Utils
});
