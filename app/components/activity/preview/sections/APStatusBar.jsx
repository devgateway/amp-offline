import React, { Component, PropTypes } from 'react';
import { ActivityConstants, Section } from 'amp-ui';
import Logger from '../../../../modules/util/LoggerManager';
import translate from '../../../../utils/translate';
import DateUtils from '../../../../utils/DateUtils';
import Utils from '../../../../utils/Utils';

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

export default Section(APStatusBar, {
  Logger,
  translate,
  DateUtils,
  Utils
});
