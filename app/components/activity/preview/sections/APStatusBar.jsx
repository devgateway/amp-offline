import React, { Component, PropTypes } from 'react';
import Status from './Status';
// import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Identification section
 * @author Nadejda Mandrescu
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
    const fieldPaths = ['AMP ID', 'Status', 'On/Off Budget'];
    return (
      <div>
        {fieldPaths.map(fieldPath => buildSimpleField(fieldPath, true))}
      </div>
    );
  }
}

export default Status(APStatusBar);
