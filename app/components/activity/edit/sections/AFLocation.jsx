import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants, ErrorConstants, ValueConstants, FieldPathConstants, GlobalSettingsConstants } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { LOCATION } from './AFSectionConstants';
import { addMessage } from '../../../../actions/NotificationAction';
import { createNotification } from '../../../../modules/helpers/ErrorNotificationHelper';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';
import { REGIONAL_SUB_PATH } from './AFRegionalFunding';

const logger = new Logger('AF location');

/**
 * Location Section
 * @author Nadejda Mandrescu
 */
class AFLocation extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    globalSettings: PropTypes.object.isRequired,
    onAddMessage: PropTypes.func.isRequired,
    activityFieldsManager: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
    this.state = {
      implementationLevel: null,
      implementationLocation: null
    };
    this.defaultCountry = null;
    this.onImplLevelOrImplLocChange = this.onImplLevelOrImplLocChange.bind(this);
    this.handleLocationsChange = this.handleLocationsChange.bind(this);
    this.checkIfRegionalFundingEnabled = this.checkIfRegionalFundingEnabled.bind(this);
  }

  componentWillMount() {
    const { globalSettings, activityFieldsManager } = this.props;
    if (globalSettings) {
      const iso2 = globalSettings[GlobalSettingsConstants.DEFAULT_COUNTRY]
        ? globalSettings[GlobalSettingsConstants.DEFAULT_COUNTRY].toUpperCase() : null;
      const defaultCountry = Object.values(activityFieldsManager.possibleValuesMap[FieldPathConstants.LOCATION_PATH])
        .find(l => (l[ActivityConstants.EXTRA_INFO] &&
          l[ActivityConstants.EXTRA_INFO][ActivityConstants.ISO2] &&
          l[ActivityConstants.EXTRA_INFO][ActivityConstants.ISO2].toUpperCase() === iso2));
      this.defaultCountry = defaultCountry ? defaultCountry[ActivityConstants.VALUE] : null;
    }
    if (this.defaultCountry === null) {
      const message = translate('defaultCountryError');
      this.props.onAddMessage(createNotification({ message, origin: ErrorConstants.NOTIFICATION_ORIGIN_ACTIVITY }));
      logger.error(message);
    }
    this.setState({
      implementationLevel: this.props.activity[ActivityConstants.IMPLEMENTATION_LEVEL],
      implementationLocation: this.props.activity[ActivityConstants.IMPLEMENTATION_LOCATION],
    });
  }

  onImplLevelOrImplLocChange() {
    const implementationLocation = this.props.activity[ActivityConstants.IMPLEMENTATION_LOCATION];
    if (implementationLocation !== this.state.implementationLocation) {
      this.props.activity[ActivityConstants.LOCATIONS] = undefined;
    }
    this.setState({
      implementationLevel: this.props.activity[ActivityConstants.IMPLEMENTATION_LEVEL],
      implementationLocation
    });
  }

  _getImplLocFilter() {
    return [{
      path: `${ActivityConstants.EXTRA_INFO}~${ActivityConstants.IMPLEMENTATION_LEVELS_EXTRA_INFO}`,
      value: this.state.implementationLevel ? this.state.implementationLevel.id : null
    }];
  }

  _getLocationFilter() {
    const locFilter = [{
      path: `${ActivityConstants.EXTRA_INFO}~${ActivityConstants.IMPLEMENTATION_LOCATION_EXTRA_INFO}`,
      value: this.state.implementationLocation ? this.state.implementationLocation.value : null
    }];
    if (this.state.implementationLevel && this.state.implementationLevel.value !== ValueConstants.INTERNATIONAL
      && this.state.implementationLocation && this.state.implementationLocation.value === ValueConstants.COUNTRY) {
      locFilter.push({
        path: 'value',
        value: this.defaultCountry
      });
    }
    return locFilter;
  }

  handleLocationsChange(locations) {
    const { activityFieldsManager } = this.props;
    if (locations) {
      if (activityFieldsManager.isFieldPathEnabled(ActivityConstants.REGIONAL_FUNDINGS_COMMITMENTS) ||
        activityFieldsManager.isFieldPathEnabled(ActivityConstants.REGIONAL_FUNDINGS_DISBURSEMENTS) ||
        activityFieldsManager.isFieldPathEnabled(ActivityConstants.REGIONAL_FUNDINGS_EXPENDITURES)) {
        const { activity } = this.props;
        FieldPathConstants.TRANSACTION_TYPES.forEach(tt => {
          const field = REGIONAL_SUB_PATH + tt;
          activity[field].forEach(rf => {
            if (!locations.find(l => (l.location._id === rf[ActivityConstants.REGION_LOCATION].id))) {
              const newFundingDetails = activity[field].slice();
              const index = newFundingDetails.findIndex((item) =>
                (item[ActivityConstants.REGION_LOCATION].id === rf[[ActivityConstants.REGION_LOCATION]].id));
              newFundingDetails.splice(index, 1);
              activity[field] = newFundingDetails;
            }
          });
        });
      }
    }
  }

  checkIfRegionalFundingEnabled() {
    const { activityFieldsManager } = this.props;
    if (activityFieldsManager.isFieldPathEnabled(ActivityConstants.REGIONAL_FUNDINGS_COMMITMENTS) ||
    activityFieldsManager.isFieldPathEnabled(ActivityConstants.REGIONAL_FUNDINGS_DISBURSEMENTS) ||
    activityFieldsManager.isFieldPathEnabled(ActivityConstants.REGIONAL_FUNDINGS_EXPENDITURES)) {
      return confirm(translate('deleteLocationRegionalFundingWarning'));
    }
    return true;
  }

  render() {
    return (<div className={afStyles.full_width}>
      <Grid className={afStyles.full_width}>
        <Row>
          <Col md={6} lg={6}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.IMPLEMENTATION_LEVEL}
              onAfterUpdate={this.onImplLevelOrImplLocChange} />
          </Col>
          <Col md={6} lg={6}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.IMPLEMENTATION_LOCATION}
              filter={this._getImplLocFilter()}
              onAfterUpdate={this.onImplLevelOrImplLocChange} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <AFField
              parent={this.props.activity} fieldPath={ActivityConstants.LOCATIONS}
              filter={this._getLocationFilter()} onAfterUpdate={this.handleLocationsChange}
              onBeforeDelete={this.checkIfRegionalFundingEnabled} />
          </Col>
        </Row>
        <Row />
      </Grid>
    </div>);
  }
}

export default connect(
  state => ({
    globalSettings: state.startUpReducer.globalSettings
  }),
  dispatch => ({
    onAddMessage: notification => dispatch(addMessage(notification))
  })
)(AFSection(AFLocation, LOCATION));
