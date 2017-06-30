/* eslint-disable class-methods-use-this */
import React, { Component, PropTypes } from 'react';
import { Panel, PanelGroup } from 'react-bootstrap';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import translate from '../../../../../utils/translate';
import AFFundingContainer from './AFFundingContainer';

/**
 * @author Gabriel Inchauspe
 */
export default class AFFundingDonorTab extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };

  static propTypes = {
    fundings: PropTypes.array.isRequired,
    organization: PropTypes.object.isRequired,
    role: PropTypes.object.isRequired
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
    // Filter only the fundings for this organization and role.
    let i = 0;
    return (<div>
      <PanelGroup activeKey={this.state.activeKey} onSelect={this.handlePanelSelect.bind(this)} accordion>
        {this.props.fundings.filter(f => (f[AC.FUNDING_DONOR_ORG_ID].id === this.props.organization.id
        && f[AC.SOURCE_ROLE].id === this.props.role.id)).map(g => {
          i += 1;
          return (<Panel
            header={`${translate('Funding Item')} ${i}`} eventKey={g[AC.GROUP_VERSIONED_FUNDING]}
            key={g[AC.GROUP_VERSIONED_FUNDING]}>
            <AFFundingContainer funding={g} />
          </Panel>);
        })}
      </PanelGroup>
    </div>);
  }
}
