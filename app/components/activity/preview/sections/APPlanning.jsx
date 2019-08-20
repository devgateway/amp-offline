import React, { Component, PropTypes } from 'react';
import { ActivityConstants, Tablify, Section } from 'amp-ui';
import translate from '../../../../utils/translate';
import DateUtils from '../../../../utils/DateUtils';
import styles from '../ActivityPreview.css';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AP Planning');

/**
 * Activity Preview Planning section
 * @author Nadejda Mandrescu
 */
class APPlanning extends Component {
  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    let content = [];
    content.push(this.props.buildSimpleField(ActivityConstants.LINE_MINISTRY_RANK, true, new Set([-1]), false));
    const fieldPaths = [ActivityConstants.ORIGINAL_COMPLETION_DATE, ActivityConstants.ACTUAL_START_DATE,
      ActivityConstants.ACTUAL_COMPLETION_DATE, ActivityConstants.PROPOSED_START_DATE,
      ActivityConstants.ACTUAL_APPROVAL_DATE, ActivityConstants.PROPOSED_COMPLETION_DATE,
      ActivityConstants.PROPOSED_APPROVAL_DATE];
    const showIfNotAvailable = new Set([ActivityConstants.ORIGINAL_COMPLETION_DATE,
      ActivityConstants.ACTUAL_START_DATE, ActivityConstants.ACTUAL_COMPLETION_DATE,
      ActivityConstants.PROPOSED_START_DATE, ActivityConstants.ACTUAL_APPROVAL_DATE,
      ActivityConstants.PROPOSED_COMPLETION_DATE, ActivityConstants.PROPOSED_APPROVAL_DATE]);
    content = content.concat(fieldPaths.map(fieldPath =>
      this.props.buildSimpleField(fieldPath, showIfNotAvailable.has(fieldPath), null, false)
    ).filter(data => data !== undefined));

    const tableContent = Tablify.addRows(content, ActivityConstants.ACTIVITY_PLANNING_COLS);
    return <div><table className={styles.box_table}><tbody>{tableContent}</tbody></table></div>;
  }

}
export default Section(APPlanning, { SectionTitle: 'Planning',
  useEncapsulateHeader: true,
  sID: 'APPlanning',
  Logger,
  translate,
  DateUtils
});
