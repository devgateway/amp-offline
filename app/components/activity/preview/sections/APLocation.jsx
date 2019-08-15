import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, APPercentageList } from 'amp-ui';
import Section from './Section';
import Logger from '../../../../modules/util/LoggerManager';
import styles from '../ActivityPreview.css';
import translate from '../../../../utils/translate';
import { rawNumberToFormattedString } from '../../../../utils/NumberUtils';

const APLocationsList = APPercentageList(ActivityConstants.LOCATIONS, ActivityConstants.LOCATION,
  ActivityConstants.LOCATION_PERCENTAGE);

const logger = new Logger('AP location');

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
    logger.debug('constructor');
  }

  render() {
    let content = [<APLocationsList
      key="locations-list" {...this.props}
      percentTitleClass={styles.percent_field_name} percentValueClass={styles.percent_field_value} tablify={false}
      translate={translate} Logger={Logger} rawNumberToFormattedString={rawNumberToFormattedString} />];
    const topContent = [ActivityConstants.IMPLEMENTATION_LEVEL, ActivityConstants.IMPLEMENTATION_LOCATION]
      .map(fp => <td key={fp}>{this.props.buildSimpleField(fp, true, new Set([0]))}</td>);
    content = content.filter(el => el !== undefined);
    let table = null;
    if ((this.props.activity[ActivityConstants.IMPLEMENTATION_LEVEL]
      && this.props.activity[ActivityConstants.IMPLEMENTATION_LEVEL].value !== 'National')
      || (this.props.activity[ActivityConstants.IMPLEMENTATION_LOCATION]
      && this.props.activity[ActivityConstants.IMPLEMENTATION_LOCATION].value !== 'Country')) {
      table = (<table className={styles.box_table2}>
        <tbody>
          {content}
        </tbody>
      </table>);
    }
    return (<div>
      <table className={styles.two_box_table}>
        <tbody>
          <tr>{topContent}</tr>
        </tbody>
      </table>
      {table}
    </div>);
  }
}

export default Section(APLocation, 'Location', true, 'APLocation');
