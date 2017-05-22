import React, { Component, PropTypes } from 'react';
import Section from './Section';
import { APInternalIdsFromIdentification } from './APInternalIds';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Identification section
 * @author Nadejda Mandrescu
 */
class APIdentification extends Component {
  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const {buildSimpleField} = this.props;
    const fieldPaths = [AC.PROJECT_TITLE, AC.AMP_ID, AC.ACTIVITY_STATUS, AC.STATUS_REASON, AC.OBJECTIVE, AC.DESCRIPTION,
      AC.PROJECT_COMMENTS, AC.LESSONS_LEARNED, AC.PROJECT_IMPACT, AC.ACTIVITY_SUMMARY, AC.CONDITIONALITIES,
      AC.PROJECT_MANAGEMENT, AC.A_C_CHAPTER];
    return (
      <div>
        {fieldPaths.map(fieldPath => buildSimpleField(fieldPath, true))}
        <APInternalIdsFromIdentification key="APInternalIdsFromIdentification"/>
      </div>
    );
  }
}

export default Section(APIdentification, 'Identification');
