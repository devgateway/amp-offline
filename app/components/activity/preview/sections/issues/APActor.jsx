import React, { Component, PropTypes } from 'react';
import Logger from '../../../../../modules/util/LoggerManager';
import styles from './APActor.css';
import FieldsManager from '../../../../../modules/field/FieldsManager';
import * as AC from '../../../../../utils/constants/ActivityConstants';

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
    if (this.props.activityFieldsManager.isFieldPathEnabled(`${AC.ISSUES}~${AC.MEASURES}~${AC.ACTORS}`)) {
      return (<div className={styles.actors}>{this.props.actor.name}</div>);
    } else {
      return null;
    }
  }
}
