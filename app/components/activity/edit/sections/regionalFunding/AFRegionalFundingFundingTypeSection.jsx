import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Panel } from 'react-bootstrap';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import AFRegionalFundingFundingDetailItem from './AFRegionalFundingFundingDetailItem';
import fundingStyles from '../funding/AFFundingContainer.css';
import translate from '../../../../../utils/translate';

const logger = new Logger('AF regional funding funding type section');

export default class AFRegionalFundingFundingTypeSection extends Component {

  static contextTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activity: PropTypes.object.isRequired,
    activityFundingSectionPanelStatus: PropTypes.array.isRequired,
  };

  static propTypes = {
    type: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    handleNewTransaction: PropTypes.func.isRequired,
    removeFundingDetailItem: PropTypes.func.isRequired,
  };

  render() {
    logger.log('render');
    const { title, location, type, handleNewTransaction, removeFundingDetailItem } = this.props;
    let button = '';
    let path = '';
    switch (type) {
      case ActivityConstants.COMMITMENTS:
        button = translate('Add Commitments');
        path = ActivityConstants.REGIONAL_FUNDINGS_COMMITMENTS;
        break;
      case ActivityConstants.DISBURSEMENTS:
        button = translate('Add Disbursements');
        path = ActivityConstants.REGIONAL_FUNDINGS_DISBURSEMENTS;
        break;
      case ActivityConstants.EXPENDITURES:
        button = translate('Add Expenditures');
        path = ActivityConstants.REGIONAL_FUNDINGS_EXPENDITURES;
        break;
      default:
        break;
    }
    if (this.context.activityFieldsManager.isFieldPathByPartsEnabled(path)) {
      return (<div>
        <Panel header={title} collapsible>
          <AFRegionalFundingFundingDetailItem
            location={location} type={type}
            removeFundingDetailItem={removeFundingDetailItem} />
          <Button
            className={fundingStyles.add_button} bsStyle="primary"
            onClick={() => handleNewTransaction(type, location)}>{button}
          </Button>
        </Panel>
      </div>);
    }
    return null;
  }
}
