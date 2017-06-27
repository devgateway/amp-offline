/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Panel, PanelGroup } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingClassificationPanel extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    funding: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  componentWillMount() {
    this.setState({ activeKey: 0 });
  }

  handlePanelSelect(activeKey) {
    this.setState({ activeKey });
  }

  render() {
    return (<div>
      <PanelGroup activeKey={this.state.activeKey} onSelect={this.handlePanelSelect.bind(this)} accordion>
        <Panel header={translate('Funding Classification')} eventKey={0}>
          TODO
        </Panel>
      </PanelGroup>
    </div>);
  }
}
