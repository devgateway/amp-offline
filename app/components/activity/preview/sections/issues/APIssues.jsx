import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Section from '../Section';
import Logger from '../../../../../modules/util/LoggerManager';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import styles from './APIssues.css';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import APMeasure from './APMeasure';
import translate from '../../../../../utils/translate';
import * as Utils from '../../../../../utils/Utils';

const logger = new Logger('AP issues');

/**
 * @author Gabriel Inchauspe
 */
class APIssues extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    logger.debug('constructor');
  }

  _buildIssues() {
    let content = [];
    if (this.props.activity[AC.ISSUES]) {
      this.props.activity[AC.ISSUES].forEach((issue) => {
        let date = '';
        if (this.props.activityFieldsManager.isFieldPathEnabled(`${AC.ISSUES}~${AC.ISSUE_DATE}`)) {
          date = ` ${createFormattedDate(issue[AC.ISSUE_DATE])}`;
        }
        content.push(
          <div className={styles.issues} key={Utils.stringToUniqueId()}>{`${issue.name || ''}${date}`}</div>);
        issue[AC.MEASURES].forEach((measure) => {
          content.push(
            <APMeasure
              key={Utils.stringToUniqueId()} activityFieldsManager={this.props.activityFieldsManager}
              measure={measure} />);
        });
      });
      if (content.length === 0) {
        content = (<div className={styles.nodata}>{translate('No Data')}</div>);
      }
    }
    return content;
  }

  render() {
    if (this.props.activityFieldsManager.isFieldPathEnabled(AC.ISSUES)) {
      return <div>{this._buildIssues()}</div>;
    } else {
      return <div className={styles.nodata}>{translate('No Data')}</div>;
    }
  }
}

export default Section(APIssues, 'Issues', true, 'APIssues');
