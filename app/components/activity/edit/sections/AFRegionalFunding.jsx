import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import Logger from '../../../../modules/util/LoggerManager';
import AFSection from './AFSection';
import { REGIONAL_FUNDING } from './AFSectionConstants';
import AFRegionalFundingFundingTypeSection from './regionalFunding/AFRegionalFundingFundingTypeSection';
import translate from '../../../../utils/translate';

const logger = new Logger('AF regional funding');

class AFRegionalFunding extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    activity: PropTypes.object.isRequired
  };

  render() {
    const { activity } = this.context;
    logger.error(activity);
    // TODO: filter by implementation type Region only.
    // TODO: create container class.
    const locations = activity.locations ? activity.locations.filter(l =>
      l.location.extra_info.implementation_location_name === 'Region') : new Set([]);
    return (<div>
      {locations.map(l => {
        const name = l.location.value;
        const id = l.location.id;
        return (<Panel collapsible header={name} key={name}>
          {this.generateRegionContent(l)}
        </Panel>);
      })}
    </div>);
  }

  generateRegionContent(location) {
    const { activity } = this.context;
    // TODO: Check if each funding type is enabled.
    return (<div>
      <AFRegionalFundingFundingTypeSection
        location={location}
        title={translate('Commitments')}
        type={ActivityConstants.COMMITMENTS} />
      <AFRegionalFundingFundingTypeSection
        location={location}
        title={translate('Disbursements')}
        type={ActivityConstants.DISBURSEMENTS} />
      <AFRegionalFundingFundingTypeSection
        location={location}
        title={translate('Expenditures')}
        type={ActivityConstants.EXPENDITURES} />
    </div>);
  }
}

export default AFSection(AFRegionalFunding, REGIONAL_FUNDING);
