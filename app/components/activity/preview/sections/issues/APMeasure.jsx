import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Logger from '../../../../../modules/util/LoggerManager';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import styles from './APMeasure.css';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import APActor from './APActor';
import * as Utils from '../../../../../utils/Utils';

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
    if (this.props.activityFieldsManager.isFieldPathEnabled(`${AC.ISSUES}~${AC.MEASURES}~${AC.MEASURE_DATE}`)) {
      date = ` ${createFormattedDate(this.props.measure[AC.MEASURE_DATE])}`;
    }
    const measure = `${this.props.measure.name || ''}${date}`;
    content.push(<div className={styles.measures} key={Utils.stringToUniqueId()}>{measure}</div>);
    this.props.measure[AC.ACTORS].forEach((actor) => {
      content.push(
        <APActor
          key={Utils.stringToUniqueId()} activityFieldsManager={this.props.activityFieldsManager} actor={actor} />);
    });
    return content;
  }

  render() {
    if (this.props.activityFieldsManager.isFieldPathEnabled(`${AC.ISSUES}~${AC.MEASURES}`)) {
      return <div>{this._buildMeasure()}</div>;
    } else {
      return null;
    }
  }
}
