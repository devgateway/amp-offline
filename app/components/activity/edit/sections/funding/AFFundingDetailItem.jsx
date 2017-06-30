/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { PanelGroup } from 'react-bootstrap';
// import * as AC from '../../../../../utils/constants/ActivityConstants';
// import * as VC from '../../../../../utils/constants/ValueConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
// import translate from '../../../../../utils/translate';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDetailItem extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fundingDetail: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    return (<div>
      <PanelGroup>
        TODO
      </PanelGroup>
    </div>);
  }
}
