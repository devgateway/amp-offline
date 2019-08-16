import React, { Component, PropTypes } from 'react';
import { ActivityConstants, FieldsManager } from 'amp-ui';
import Logger from '../../../../../modules/util/LoggerManager';
import styles from './APActor.css';

const logger = new Logger('AP actor');

/**
 * @author Gabriel Inchauspe
 */
export default class APActors extends Component {
  /* eslint-disable react/no-unused-prop-types */
  static propTypes = {
    actor: PropTypes.object.isRequired,
    activityFieldsManager: PropTypes.instanceOf(FieldsManager).isRequired
  };
  /* eslint-enable react/no-unused-prop-types */

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  render() {
    if (this.props.activityFieldsManager
      .isFieldPathEnabled(`${ActivityConstants.ISSUES}~${ActivityConstants.MEASURES}~${ActivityConstants.ACTORS}`)) {
      return (<div className={styles.actors}>{this.props.actor.name || ''}</div>);
    } else {
      return null;
    }
  }
}
