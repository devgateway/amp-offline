import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Col, Grid, Row } from 'react-bootstrap';
import afStyles from '../ActivityForm.css';
import AFSection from './AFSection';
import AFField from '../components/AFField';
import { LOCATION } from './AFSectionConstants';
import {
  IMPLEMENTATION_LEVEL,
  IMPLEMENTATION_LOCATION,
  LOCATIONS
} from '../../../../utils/constants/ActivityConstants';
import { COUNTRY_BY_ISO2 } from '../../../../utils/constants/CountryByIso';
import { DEFAULT_COUNTRY } from '../../../../utils/constants/GlobalSettingsConstants';
import { addMessage } from '../../../../actions/NotificationAction';
import { createNotification } from '../../../../modules/helpers/ErrorNotificationHelper';
import { NOTIFICATION_ORIGIN_ACTIVITY } from '../../../../utils/constants/ErrorConstants';
import translate from '../../../../utils/translate';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Location Section
 * @author Nadejda Mandrescu
 */
class AFLocation extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    globalSettings: PropTypes.object.isRequired,
    onAddMessage: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
    this.state = {
      implementationLevel: null,
      implementationLocation: null,
      searchReady: false
    };
    this.defaultCountry = null;
    this.onImplLevelOrImplLocChange = this.onImplLevelOrImplLocChange.bind(this);
  }

  componentWillMount() {
    const { globalSettings } = this.props;
    if (globalSettings) {
      const iso2 = globalSettings[DEFAULT_COUNTRY] ? globalSettings[DEFAULT_COUNTRY].toUpperCase() : null;
      this.defaultCountry = COUNTRY_BY_ISO2[iso2] ? COUNTRY_BY_ISO2[iso2].toUpperCase() : null;
    }
    if (this.defaultCountry === null) {
      const message = translate('defaultCountryError');
      this.props.onAddMessage(createNotification({ message, origin: NOTIFICATION_ORIGIN_ACTIVITY }));
      LoggerManager.error(message);
    }
    this.setState({
      implementationLevel: this.props.activity[IMPLEMENTATION_LEVEL],
      implementationLocation: this.props.activity[IMPLEMENTATION_LOCATION],
    });
  }

  onImplLevelOrImplLocChange() {
    this.setState({
      implementationLevel: this.props.activity[IMPLEMENTATION_LEVEL],
      implementationLocation: this.props.activity[IMPLEMENTATION_LOCATION],
    });
  }

  _getImplLocFilter() {
    return [{
      path: 'extra_info~implementation-levels',
      value: this.state.implementationLevel ? this.state.implementationLevel.id : null
    }];
  }

  _getLocationFilter() {
    const locFilter = [{
      path: 'extra_info~implementation_location_name',
      value: this.state.implementationLocation ? this.state.implementationLocation.value : null
    }];
    if (this.state.implementationLevel && this.state.implementationLevel.value !== 'International'
      && this.state.implementationLocation && this.state.implementationLocation.value === 'Country') {
      locFilter.push({
        path: 'value',
        value: this.defaultCountry
      });
    }
    return locFilter;
  }

  render() {
    return (<div className={afStyles.full_width} >
      <Grid className={afStyles.full_width} >
        <Row>
          <Col md={6} lg={6} >
            <AFField
              parent={this.props.activity} fieldPath={IMPLEMENTATION_LEVEL}
              onAfterUpdate={this.onImplLevelOrImplLocChange} />
          </Col>
          <Col md={6} lg={6} >
            <AFField
              parent={this.props.activity} fieldPath={IMPLEMENTATION_LOCATION} filter={this._getImplLocFilter()}
              onAfterUpdate={this.onImplLevelOrImplLocChange} />
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12} >
            <AFField parent={this.props.activity} fieldPath={LOCATIONS} filter={this._getLocationFilter()} />
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
