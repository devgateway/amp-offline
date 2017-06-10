import React, { Component, PropTypes } from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import AFSection from './AFSection';
import { FUNDING } from './AFSectionConstants';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Funding Section
 * @author Nadejda Mandrescu
 */
class AFFunding extends Component {

  static propTypes = {
    activity: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  generateFundingTabs() {
    if (this.props.activity.fundings) {
      return this.props.activity.fundings.map((funding) => (
        <ReactBootstrap.Tab eventKey={funding[AC.AMP_FUNDING_ID]} title={funding[AC.FUNDING_DONOR_ORG_ID].value}>Tab 2
          content</ReactBootstrap.Tab>
      ));
    }
    return null;
  }

  render() {
    return (<ReactBootstrap.Tabs defaultActiveKey={0} onSelect={this.handleSelect} id="funding-tabs-container-tabs">
      <ReactBootstrap.Tab eventKey={0} title="Overview">Overview</ReactBootstrap.Tab>
      {this.generateFundingTabs()}
    </ReactBootstrap.Tabs>);
  }
}

export default AFSection(AFFunding, FUNDING);
