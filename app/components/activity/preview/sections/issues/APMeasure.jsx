/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldsManager, UIUtils } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import styles from './APMeasure.css';
import APActor from './APActor';

const logger = new Logger('AP measure');

/**
 * @author Gabriel Inchauspe
 */
export default class APMeasures extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    measure: PropTypes.object.isRequired
  };

  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  _buildMeasure() {
    const content = [];
    let date = '';
    if (this.props.activityFieldsManager.isFieldPathEnabled(`${ActivityConstants.ISSUES}~${ActivityConstants.MEASURES}~${ActivityConstants.MEASURE_DATE}`)) {
      date = ` ${createFormattedDate(this.props.measure[ActivityConstants.MEASURE_DATE])}`;
    }
    const measure = `${this.props.measure.name || ''}${date}`;
    content.push(<div className={styles.measures} key={UIUtils.stringToUniqueId()}>{measure}</div>);
    this.props.measure[ActivityConstants.ACTORS].forEach((actor) => {
      content.push(
        <APActor
          key={UIUtils.stringToUniqueId()} activityFieldsManager={this.props.activityFieldsManager} actor={actor} />);
    });
    return content;
  }

  render() {
    if (this.props.activityFieldsManager.isFieldPathEnabled(`${ActivityConstants.ISSUES}~${ActivityConstants.MEASURES}`)) {
      return <div>{this._buildMeasure()}</div>;
    } else {
      return null;
    }
  }
}
