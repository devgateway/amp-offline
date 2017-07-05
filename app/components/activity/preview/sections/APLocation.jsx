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
import styles from '../ActivityPreview.css';

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
    let content = [<APLocationsList
      key="locations-list" {...this.props}
      percentTitleClass={styles.percent_field_name} percentValueClass={styles.percent_field_value} />];
    const topContent = [];
    topContent.push(<td>{this.props.buildSimpleField(IMPLEMENTATION_LEVEL, true, new Set([0]))} </td>);
    topContent.push(<td>{this.props.buildSimpleField(IMPLEMENTATION_LOCATION, true, new Set([0]))} </td>);
    content = content.filter(el => el !== undefined);
    return (<div>
      <table className={styles.two_box_table}>
        <tbody>
          <tr>{topContent}</tr>
        </tbody>
      </table>
      <table className={styles.box_table2}>
        <tbody>
          {content}
        </tbody>
      </table>
    </div>);
  }

}

export default Section(APLocation, 'Location', true, 'APLocation');
