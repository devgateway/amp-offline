import React, { Component, PropTypes } from 'react';
import LoggerManager from '../../../../../modules/util/LoggerManager';
import styles from './APActor.css';
import ActivityFieldsManager from '../../../../../modules/activity/ActivityFieldsManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';

/**
 * @author Gabriel Inchauspe
 */
export default class APActors extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    actor: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(ActivityFieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    LoggerManager.log('constructor');
  }

  render() {
    if (this.props.activityFieldsManager.isFieldPathEnabled(`${AC.ISSUES}~${AC.MEASURES}~${AC.ACTORS}`)) {
      return (<div className={styles.actors}>{this.props.actor.name}</div>);
    } else {
      return null;
    }
  }
}
