import React, { Component, PropTypes } from 'react';
import Section from './Section';
import APField from '../components/APField';
import APPercentageField from '../components/APPercentageField';
import * as AC from '../../../../utils/constants/ActivityConstants';
import LoggerManager from '../../../../modules/util/LoggerManager';

/**
 * Activity Preview Locations section
 * @author Nadejda Mandrescu
 */
class APLocation extends Component {
  static propTypes = {
    activity: PropTypes.object.isRequired,
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    let content = [];
    const locations = this.props.activity[AC.LOCATIONS];
    if (locations && locations.length) {
      content = locations.map(loc => {
        const locFullName = loc[AC.LOCATION][AC.FULL_NAME];
        const fieldValue = <APPercentageField title={locFullName} value={loc[AC.LOCATION_PERCENTAGE]} />;
        return <APField key={locFullName} value={fieldValue} inline />;
      });
    }
    content.push(this.props.buildSimpleField(AC.IMPLEMENTATION_LEVEL, true, new Set([0])));
    content.push(this.props.buildSimpleField(AC.IMPLEMENTATION_LOCATION, true, new Set([0])));
    content = content.filter(el => el !== undefined);
    return <div>{content}</div>;
  }

}

export default Section(APLocation, 'Location');
