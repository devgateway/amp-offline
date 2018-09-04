import React, { Component, PropTypes } from 'react';
import Section from './Section';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';
import FieldsManager from '../../../../modules/field/FieldsManager';
import * as VC from '../../../../utils/constants/ValueConstants';

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
    logger.log('constructor');
  }

  render() {
    const { buildSimpleField } = this.props;
    const fieldPaths = [AC.STATUS_REASON, AC.TYPE_OF_IMPLEMENTATION,
      AC.MODALITIES, AC.OBJECTIVE, AC.DESCRIPTION, AC.PROJECT_COMMENTS, AC.RESULTS, AC.LESSONS_LEARNED,
      AC.PROJECT_IMPACT, AC.ACTIVITY_SUMMARY, AC.CONDITIONALITIES, AC.PROJECT_MANAGEMENT, AC.BUDGET_CODE_PROJECT_ID,
      AC.A_C_CHAPTER, AC.CRIS_NUMBER, AC.ACTIVITY_BUDGET, AC.GOVERNMENT_APPROVAL_PROCEDURES, AC.HUMANITARIAN_AID];
    // Show ministry_code and FY only when activity_budget is enabled and has value 'On Budget'.
    if (this.props.activityFieldsManager.isFieldPathEnabled(AC.ACTIVITY_BUDGET)
      && this.props.activity[AC.ACTIVITY_BUDGET]
      && this.props.activity[AC.ACTIVITY_BUDGET].value === VC.ON_BUDGET) {
      fieldPaths.push(AC.MINISTRY_CODE);
      fieldPaths.push(`${AC.FY}~${AC.YEAR}`);
    }
    return (
      <div>
        {fieldPaths.map(fieldPath => buildSimpleField(fieldPath, true))}
      </div>
    );
  }
}

export default Section(APIdentification, 'Identification', true, 'APIdentification');
