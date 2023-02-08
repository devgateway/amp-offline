import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Panel } from 'react-bootstrap';
import { ActivityConstants, FieldsManager, UIUtils } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import AFRegionalFundingDetailItems from './AFRegionalFundingDetailItems';
import fundingStyles from '../funding/AFFundingContainer.css';
import translate from '../../../../../utils/translate';
import styles from './AFRegionalFundingDetailItems.css';

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
    activity: PropTypes.object.isRequired,
    hasErrors: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { location, activity, type } = this.props;
    this._handlePanelOpenClose = this._handlePanelOpenClose.bind(this);
    const path = `${type}_panelOpen`;
    this.state = { path, panelOpen: this.findLocation(activity, location)[path] };
  }

  // eslint-disable-next-line class-methods-use-this
  findLocation(activity, location) {
    return activity[ActivityConstants.LOCATIONS].find(l => l.location.id === location.location.id);
  }

  _handlePanelOpenClose() {
    const { activity, location } = this.props;
    const { path } = this.state;
    const open = !this.state.panelOpen;
    this.setState({ panelOpen: open });
    this.findLocation(activity, location)[path] = open;
  }

  render() {
    logger.log('render');
    const { title, location, type, handleNewTransaction, removeFundingDetailItem, hasErrors, activity } = this.props;
    const { panelOpen } = this.state;
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
      const items = activity[path].filter(l => l[ActivityConstants.REGION_LOCATION].id === location.location.id);
      // Add a temporal_id field so we can delete items.
      items.forEach(i => {
        if (!i[ActivityConstants.TEMPORAL_ID]) {
          i[ActivityConstants.TEMPORAL_ID] = UIUtils.numberRandom();
        }
      });
      return (
        <div>
          <Panel
            key={Math.random()}
            expanded={panelOpen} className={hasErrors(items) ? fundingStyles.error : ''}>
            <Panel.Heading>
              <Panel.Title
                toggle onClick={() => this._handlePanelOpenClose}>
                {title}
              </Panel.Title>
            </Panel.Heading>
            <Panel.Collapse>
              <Panel.Body>
                <AFRegionalFundingDetailItems
                  items={items} type={type}
                  removeFundingDetailItem={removeFundingDetailItem}
                  hasErrors={hasErrors} />
                <Button
                  className={styles.add_button} bsStyle="primary"
                  onClick={() => handleNewTransaction(type, location)}>{button}
                </Button>
              </Panel.Body>
            </Panel.Collapse>
          </Panel>
        </div>
      );
    }
    return null;
  }
}
