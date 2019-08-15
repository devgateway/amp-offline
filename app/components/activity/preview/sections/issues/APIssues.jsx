import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityConstants, FieldsManager, Section } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import styles from './APIssues.css';
import APMeasure from './APMeasure';
import translate from '../../../../../utils/translate';
import * as Utils from '../../../../../utils/Utils';
import DateUtils from '../../../../../utils/DateUtils';

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
    if (this.props.activity[ActivityConstants.ISSUES]) {
      this.props.activity[ActivityConstants.ISSUES].forEach((issue) => {
        let date = '';
        if (this.props.activityFieldsManager
          .isFieldPathEnabled(`${ActivityConstants.ISSUES}~${ActivityConstants.ISSUE_DATE}`)) {
          date = ` ${DateUtils.createFormattedDate(issue[ActivityConstants.ISSUE_DATE])}`;
        }
        content.push(
          <div className={styles.issues} key={Utils.stringToUniqueId()}>{`${issue.name || ''}${date}`}</div>);
        issue[ActivityConstants.MEASURES].forEach((measure) => {
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
    if (this.props.activityFieldsManager.isFieldPathEnabled(ActivityConstants.ISSUES)) {
      return <div>{this._buildIssues()}</div>;
    } else {
      return <div className={styles.nodata}>{translate('No Data')}</div>;
    }
  }
}

export default Section(APIssues, { SectionTitle: 'Issues',
  useEncapsulateHeader: true,
  sID: 'APIssues',
  Logger,
  translate,
  DateUtils,
  Utils
});
