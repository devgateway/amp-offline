import React, { Component, PropTypes } from 'react';
import Section from './Section';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Status Bar section
 * @author Anya Marshall
 */
class APStatusBar extends Component {
  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    const { buildSimpleField } = this.props;
    const fieldPaths = [AC.AMP_ID, AC.ACTIVITY_STATUS, AC.ACTIVITY_BUDGET];
    return (
      <div>
        {fieldPaths.map(fieldPath => buildSimpleField(fieldPath, true, null, true))}
      </div>
    );
  }
}

export default Section(APStatusBar);
