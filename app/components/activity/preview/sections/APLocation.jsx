import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APPercentageList from '../components/APPercentageList';
import {
  LOCATIONS,
  LOCATION,
  LOCATION_PERCENTAGE,
  IMPLEMENTATION_LEVEL,
  IMPLEMENTATION_LOCATION
} from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

const APLocationsList = APPercentageList(LOCATIONS, LOCATION, LOCATION_PERCENTAGE);

/**
 * Activity Preview Locations section
 * @author Nadejda Mandrescu
 */
class APLocation extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired, // eslint-disable-line
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    let content = [<APLocationsList key="locations-list" {...this.props}/>];
    content.push(this.props.buildSimpleField(IMPLEMENTATION_LEVEL, true, new Set([0])));
    content.push(this.props.buildSimpleField(IMPLEMENTATION_LOCATION, true, new Set([0])));
    content = content.filter(el => el !== undefined);
    return <div>{content}</div>;
  }

}

export default Section(APLocation, 'Location');
