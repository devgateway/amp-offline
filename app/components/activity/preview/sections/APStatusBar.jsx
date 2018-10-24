import React, { Component, PropTypes } from 'react';
import Section from './Section';
import * as AC from '../../../../utils/constants/ActivityConstants';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP status bar');

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
    logger.debug('constructor');
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
