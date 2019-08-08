import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, Grid, Row } from 'react-bootstrap';
import { ActivityConstants, ErrorConstants } from 'amp-ui';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { LOCATION } from './AFSectionConstants';
import { DEFAULT_COUNTRY } from '../../../../utils/constants/GlobalSettingsConstants';
import { addMessage } from '../../../../actions/NotificationAction';
import { createNotification } from '../../../../modules/helpers/ErrorNotificationHelper';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';
import { COUNTRY, INTERNATIONAL } from '../../../../utils/constants/ValueConstants';
import { LOCATION_PATH } from '../../../../utils/constants/FieldPathConstants';

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
  }

  componentWillMount() {
    const { globalSettings, activityFieldsManager } = this.props;
    if (globalSettings) {
      const iso2 = globalSettings[DEFAULT_COUNTRY] ? globalSettings[DEFAULT_COUNTRY].toUpperCase() : null;
      const defaultCountry = Object.values(activityFieldsManager.possibleValuesMap[LOCATION_PATH])
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
    if (this.state.implementationLevel && this.state.implementationLevel.value !== INTERNATIONAL
      && this.state.implementationLocation && this.state.implementationLocation.value === COUNTRY) {
      locFilter.push({
        path: 'value',
        value: this.defaultCountry
      });
    }
    return locFilter;
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
              filter={this._getLocationFilter()} />
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
