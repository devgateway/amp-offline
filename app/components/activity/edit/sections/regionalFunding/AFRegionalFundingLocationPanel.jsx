import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { ActivityConstants, FieldsManager, FieldPathConstants } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import AFRegionalFundingFundingTypeSection from '../regionalFunding/AFRegionalFundingFundingTypeSection';
import translate from '../../../../../utils/translate';
import fundingStyles from '../funding/AFFundingContainer.css';
import { REGIONAL_SUB_PATH } from '../AFRegionalFunding';

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
    activity: PropTypes.object.isRequired,
    hasErrors: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { location, activity } = this.props;
    this._handlePanelOpenClose = this._handlePanelOpenClose.bind(this);
    this.state = { panelOpen: this.findLocation(activity, location).regionalFundingPanelOpen };
  }

  _handlePanelOpenClose() {
    const { activity, location } = this.props;
    const open = !this.state.panelOpen;
    this.setState({ panelOpen: open });
    this.findLocation(activity, location).regionalFundingPanelOpen = open;
  }

  // eslint-disable-next-line class-methods-use-this
  findLocation(activity, location) {
    return activity[ActivityConstants.LOCATIONS].find(l => l.location.id === location.location.id);
  }

  render() {
    logger.log('render');
    const { location, handleNewTransaction, removeFundingDetailItem, activity, hasErrors } = this.props;
    const { panelOpen } = this.state;
    const name = location.location.value;
    // Look for errors on Commitments/Disbursements/Expenditures too.
    const errorsOnInternalSections = FieldPathConstants.TRANSACTION_TYPES
      .some(t => hasErrors(activity[REGIONAL_SUB_PATH + t]
        .filter(l => l[ActivityConstants.REGION_LOCATION].id === location.location.id)));
    return (<Panel
      key={name} expanded={panelOpen}
      className={hasErrors(location) || errorsOnInternalSections ? fundingStyles.error : ''}>
      <Panel.Heading>
        <Panel.Title
          toggle
          onClick={this._handlePanelOpenClose}
        >
          {name}
        </Panel.Title>
      </Panel.Heading>
      <Panel.Collapse>
        <Panel.Body>
          <div>
            <AFRegionalFundingFundingTypeSection
              location={location}
              activity={activity}
              title={translate('Commitments')}
              hasErrors={hasErrors}
              type={ActivityConstants.COMMITMENTS}
              removeFundingDetailItem={removeFundingDetailItem.bind(this, ActivityConstants.COMMITMENTS)}
              handleNewTransaction={handleNewTransaction} />
            <AFRegionalFundingFundingTypeSection
              location={location}
              activity={activity}
              title={translate('Disbursements')}
              hasErrors={hasErrors}
              type={ActivityConstants.DISBURSEMENTS}
              removeFundingDetailItem={removeFundingDetailItem.bind(this, ActivityConstants.DISBURSEMENTS)}
              handleNewTransaction={handleNewTransaction} />
            <AFRegionalFundingFundingTypeSection
              location={location}
              activity={activity}
              title={translate('Expenditures')}
              hasErrors={hasErrors}
              type={ActivityConstants.EXPENDITURES}
              removeFundingDetailItem={removeFundingDetailItem.bind(this, ActivityConstants.EXPENDITURES)}
              handleNewTransaction={handleNewTransaction} />
          </div>
        </Panel.Body></Panel.Collapse>
    </Panel>);
  }
}
