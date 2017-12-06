import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Tablify from '../components/Tablify';
import styles from '../ActivityPreview.css';
import * as AC from '../../../../utils/constants/ActivityConstants';
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
    content.push(this.props.buildSimpleField(AC.LINE_MINISTRY_RANK, true, new Set([-1]), false));
    const fieldPaths = [AC.PROPOSED_APPROVAL_DATE, AC.ACTUAL_APPROVAL_DATE, AC.PROPOSED_START_DATE,
      AC.ACTUAL_START_DATE, AC.ORIGINAL_COMPLETION_DATE, AC.PROPOSED_COMPLETION_DATE, AC.ACTUAL_COMPLETION_DATE];
    const showIfNotAvailable = new Set([AC.PROPOSED_APPROVAL_DATE, AC.ACTUAL_APPROVAL_DATE, AC.PROPOSED_START_DATE,
      AC.ACTUAL_START_DATE, AC.ORIGINAL_COMPLETION_DATE, AC.PROPOSED_COMPLETION_DATE, AC.ACTUAL_COMPLETION_DATE]);
    content = content.concat(fieldPaths.map(fieldPath =>
      this.props.buildSimpleField(fieldPath, showIfNotAvailable.has(fieldPath), null, false)
    ).filter(data => data !== undefined));

    const tableContent = Tablify.addRows(content, AC.ACTIVITY_PLANNING_COLS);
    return <div><table className={styles.box_table}><tbody>{tableContent}</tbody></table></div>;
  }

}

export default Section(APPlanning, 'Planning', true, 'APPlanning');
