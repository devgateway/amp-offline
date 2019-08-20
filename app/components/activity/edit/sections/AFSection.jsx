import React, { Component, PropTypes } from 'react';
import * as styles from '../ActivityForm.css';
import FieldsManager from '../../../../modules/field/FieldsManager';
import ActivityFundingTotals from '../../../../modules/activity/ActivityFundingTotals';
import translate from '../../../../utils/translate';
import Logger from '../../../../modules/util/LoggerManager';

const logger = new Logger('AF section');

/* eslint-disable class-methods-use-this */

/**
 * A generic Activity Form section
 * @author Nadejda Mandrescu
 */
const AFSection = (ComposedSection, SectionTitle) => class extends Component {
  // TODO based on design if we can reuse section from preview
  static contextTypes = {
    activity: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired,
    activityFundingTotals: PropTypes.instanceOf(ActivityFundingTotals).isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    const composedSection = (<ComposedSection {...this.props} {...this.state} {...this.context} />);
    return (
      <div className={styles.section_group}>
        <div className={styles.section_title}>{translate(SectionTitle)}</div>
        <div>
          {composedSection}
        </div>
      </div>
    );
  }
};

export default AFSection;
