import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import AFRegionalFundingFundingTypeSection from '../regionalFunding/AFRegionalFundingFundingTypeSection';
import translate from '../../../../../utils/translate';

const logger = new Logger('AF regional funding location panel');

export default class AFRegionalFundingLocationPanel extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    handleNewTransaction: PropTypes.func.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
  };

  render() {
    logger.log('render');
    const { location, handleNewTransaction, removeFundingDetailItem } = this.props;
    const name = location.location.value;
    return (<Panel collapsible header={name} key={name}>
      <div>
        <AFRegionalFundingFundingTypeSection
          location={location}
          title={translate('Commitments')}
          type={ActivityConstants.COMMITMENTS}
          removeFundingDetailItem={removeFundingDetailItem.bind(this, ActivityConstants.COMMITMENTS)}
          handleNewTransaction={handleNewTransaction} />
        <AFRegionalFundingFundingTypeSection
          location={location}
          title={translate('Disbursements')}
          type={ActivityConstants.DISBURSEMENTS}
          removeFundingDetailItem={removeFundingDetailItem.bind(this, ActivityConstants.DISBURSEMENTS)}
          handleNewTransaction={handleNewTransaction} />
        <AFRegionalFundingFundingTypeSection
          location={location}
          title={translate('Expenditures')}
          type={ActivityConstants.EXPENDITURES}
          removeFundingDetailItem={removeFundingDetailItem.bind(this, ActivityConstants.EXPENDITURES)}
          handleNewTransaction={handleNewTransaction} />
      </div>
    </Panel>);
  }
}
