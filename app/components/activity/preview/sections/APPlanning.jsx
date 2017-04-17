import React, { Component, PropTypes } from 'react';
import Section from './Section';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Activity Preview Planning section
 * @author Nadejda Mandrescu
 */
class APPlanning extends Component {
  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    let content = [];
    content.push(this.props.buildSimpleField(AC.LINE_MINISTRY_RANK, true, new Set([-1])));
    const fieldPaths = [AC.PROPOSED_APPROVAL_DATE, AC.ACTUAL_APPROVAL_DATE, AC.PROPOSED_START_DATE,
      AC.ACTUAL_START_DATE, AC.ORIGINAL_COMPLETION_DATE, AC.PROPOSED_COMPLETION_DATE, AC.ACTUAL_COMPLETION_DATE];
    const showIfNotAvailable = new Set([AC.PROPOSED_APPROVAL_DATE, AC.ACTUAL_APPROVAL_DATE, AC.PROPOSED_START_DATE,
      AC.ACTUAL_START_DATE, AC.ORIGINAL_COMPLETION_DATE, AC.PROPOSED_COMPLETION_DATE, AC.ACTUAL_COMPLETION_DATE]);
    content = content.concat(fieldPaths.map(fieldPath =>
      this.props.buildSimpleField(fieldPath, showIfNotAvailable.has(fieldPath))).filter(data => data !== undefined));
    return <div>{content}</div>;
  }

}

export default Section(APPlanning, 'Planning');
