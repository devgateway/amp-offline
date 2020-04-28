import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldsManager, UIUtils } from 'amp-ui';
import Logger from '../../../../modules/util/LoggerManager';
import AFSection from './AFSection';
import { REGIONAL_FUNDING } from './AFSectionConstants';
import translate from '../../../../utils/translate';
import DateUtils from '../../../../utils/DateUtils';
import AFRegionalFundingLocationPanel from './regionalFunding/AFRegionalFundingLocationPanel';

const logger = new Logger('AF regional funding');

export const REGIONAL_SUB_PATH = 'regional_';

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
    this.hasErrors = this.hasErrors.bind(this);
  }

  // Evaluate if a fundings section has errors.
  hasErrors(container) {
    if (container) {
      if (container instanceof Array) {
        let error = false;
        container.forEach(c => {
          // Only find the first error.
          if (!error) {
            error = this.hasErrors(c);
          }
        });
        return error;
      } else if (container.errors) {
        const withoutMessage = container.errors.filter(e => e.errorMessage === undefined);
        const withMessage = container.errors.filter(e => e.errorMessage);
        const difference = withMessage.filter(e => withoutMessage.filter(e2 => e2.path === e.path).length === 0);
        return difference.length > 0;
      }
    }
    return false;
  }

  _addTransactionItem(trnType, location) {
    logger.debug('_addTransactionItem');
    const { activity } = this.context;
    const path = `${REGIONAL_SUB_PATH}${trnType}`;
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
    this.forceUpdate();
  }

  _removeFundingDetailItem(trnType, id) {
    logger.debug('_removeFundingDetailItem');
    if (confirm(translate('deleteFundingTransactionItem'))) {
      const { activity } = this.context;
      const path = `${REGIONAL_SUB_PATH}${trnType}`;
      const newFundingDetails = activity[path].slice();
      const index = newFundingDetails.findIndex((item) => (item[ActivityConstants.TEMPORAL_ID] === id));
      newFundingDetails.splice(index, 1);
      activity[path] = newFundingDetails;
      this.forceUpdate();
    }
  }

  render() {
    const { activity } = this.context;
    logger.error(activity);
    const locations = activity[ActivityConstants.LOCATIONS] ? activity[ActivityConstants.LOCATIONS].filter(l =>
      l.location.extra_info.implementation_location_name === ActivityConstants.REGION) : new Set([]);
    return (<div>
      {locations.map(l => {
        logger.log('Add panel');
        return (<AFRegionalFundingLocationPanel
          activity={activity}
          location={l} key={l.location.id}
          removeFundingDetailItem={this._removeFundingDetailItem}
          handleNewTransaction={this._addTransactionItem}
          hasErrors={this.hasErrors} />);
      })}
    </div>);
  }
}

export default AFSection(AFRegionalFunding, REGIONAL_FUNDING);
