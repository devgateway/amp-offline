import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { ActivityConstants, FieldsManager, UIUtils } from 'amp-ui';
import Logger from '../../../../modules/util/LoggerManager';
import AFSection from './AFSection';
import { REGIONAL_FUNDING } from './AFSectionConstants';
import AFRegionalFundingFundingTypeSection from './regionalFunding/AFRegionalFundingFundingTypeSection';
import translate from '../../../../utils/translate';
import DateUtils from '../../../../utils/DateUtils';
import AFRegionalFundingLocationPanel from './regionalFunding/AFRegionalFundingLocationPanel';

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

  constructor(props) {
    super(props);
    this._addTransactionItem = this._addTransactionItem.bind(this);
    this._removeFundingDetailItem = this._removeFundingDetailItem.bind(this);
  }

  _addTransactionItem(trnType, location) {
    logger.debug('_addTransactionItem');
    const { activity } = this.context;
    const path = `regional_${trnType}`;
    const fundingDetailItem = {};
    fundingDetailItem[ActivityConstants.TRANSACTION_DATE] = DateUtils.getTimestampForAPI(new Date());
    fundingDetailItem[ActivityConstants.CURRENCY] = {};
    fundingDetailItem[ActivityConstants.TRANSACTION_AMOUNT] = undefined;
    fundingDetailItem[ActivityConstants.ADJUSTMENT_TYPE] = undefined;
    fundingDetailItem[ActivityConstants.TEMPORAL_ID] = UIUtils.numberRandom();
    fundingDetailItem[ActivityConstants.REGION_LOCATION] = location.location;
    let newFunding = activity[path];
    if (newFunding === undefined) {
      newFunding = [];
    }
    newFunding.push(fundingDetailItem);
    activity[path] = newFunding;
    this.forceUpdate(); // TODO: update through state change.
  }

  _removeFundingDetailItem(trnType, id) {
    logger.debug('_removeFundingDetailItem');
    if (confirm(translate('deleteFundingTransactionItem'))) {
      const { activity } = this.context;
      const path = `regional_${trnType}`;
      const newFundingDetails = activity[path].slice();
      const index = newFundingDetails.findIndex((item) => (item[ActivityConstants.TEMPORAL_ID] === id));
      newFundingDetails.splice(index, 1);
      activity[path] = newFundingDetails;
      this.forceUpdate(); // TODO: update through state change.
    }
  }

  render() {
    const { activity } = this.context;
    logger.error(activity);
    // TODO: filter by implementation type Region only.
    // TODO: create container class.
    const locations = activity.locations ? activity.locations.filter(l =>
      l.location.extra_info.implementation_location_name === 'Region') : new Set([]);
    return (<div>
      {locations.map(l => (<AFRegionalFundingLocationPanel
        location={l} key={l.location.id}
        removeFundingDetailItem={this._removeFundingDetailItem}
        handleNewTransaction={this._addTransactionItem} />))}
    </div>);
  }
}

export default AFSection(AFRegionalFunding, REGIONAL_FUNDING);
