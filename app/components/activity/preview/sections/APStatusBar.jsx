import React, { Component, PropTypes } from 'react';
import { ActivityConstants } from 'amp-ui';
import Section from './Section';
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
    const fieldPaths = [ActivityConstants.AMP_ID, ActivityConstants.ACTIVITY_STATUS, ActivityConstants.ACTIVITY_BUDGET];
    return (
      <div>
        {fieldPaths.map(fieldPath => buildSimpleField(fieldPath, true, null, true))}
      </div>
    );
  }
}

export default Section(APStatusBar);
