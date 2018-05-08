import React, { Component, PropTypes } from 'react';
import Section from '../Section';
import Logger from '../../../../../modules/util/LoggerManager';
import { createFormattedDate } from '../../../../../utils/DateUtils';
import styles from './APIssues.css';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';
import APMeasure from './APMeasure';
import translate from '../../../../../utils/translate';

const logger = new Logger('AP issues');

/**
 * @author Gabriel Inchauspe
 */
class APIssues extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  _buildIssues() {
    let content = [];
    if (this.props.activity[AC.ISSUES]) {
      this.props.activity[AC.ISSUES].forEach((issue) => {
        let date = '';
        if (this.props.activityFieldsManager.isFieldPathEnabled(`${AC.ISSUES}~${AC.ISSUE_DATE}`)) {
          date = ` - ${createFormattedDate(issue[AC.ISSUE_DATE])}`;
        }
        content.push(<div className={styles.issues}>{`${issue.name}${date}`}</div>);
        issue[AC.MEASURES].forEach((measure) => {
          content.push(<APMeasure activityFieldsManager={this.props.activityFieldsManager} measure={measure} />);
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
