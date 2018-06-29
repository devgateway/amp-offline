import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Logger from '../../../../modules/util/LoggerManager';
import * as AC from '../../../../utils/constants/ActivityConstants';
import styles from '../ActivityPreview.css';

const logger = new Logger('AP structures');

/**
 * Activity Preview Structures section
 * @author Gabriel Inchauspe
 */
class APStructures extends Component {

  static propTypes = {
    buildSimpleField: PropTypes.func.isRequired,
    activity: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    logger.log('constructor');
  }

  getCoordinates(structure) {
    const { buildSimpleField } = this.props;
    if (structure[AC.STRUCTURES_SHAPE] === AC.STRUCTURES_POINT) {
      const content = [];
      content.push(
        <td>{buildSimpleField(`${[AC.STRUCTURES]}~${[AC.STRUCTURES_LATITUDE]}`, true, null, false, structure)}</td>);
      content.push(
        <td>{buildSimpleField(`${[AC.STRUCTURES]}~${[AC.STRUCTURES_LONGITUDE]}`, true, null, false, structure)}</td>);
      return (
        <table className={styles.structures_coordinates_table}>
          <tbody>
            <tr>{content}</tr>
          </tbody>
        </table>);
    } else {
      const content = [];
      structure[AC.STRUCTURES_COORDINATES].forEach(c => {
        content.push(
          <tr>
            <td>{buildSimpleField(`${[AC.STRUCTURES]}~${AC.STRUCTURES_COORDINATES}~${[AC.STRUCTURES_LATITUDE]}`,
              true, null, false, c)}</td>
            <td>{buildSimpleField(`${[AC.STRUCTURES]}~${AC.STRUCTURES_COORDINATES}~${[AC.STRUCTURES_LONGITUDE]}`,
              true, null, false, c)}</td>
          </tr>);
      });
      return (
        <table className={styles.structures_coordinates_table}>
          <tbody>
            {content}
          </tbody>
        </table>);
    }
  }

  render() {
    const { activity, buildSimpleField } = this.props;
    if (activity[AC.STRUCTURES]) {
      return (
        <div>{activity[AC.STRUCTURES].map(s => (
          <div>
            <div className={styles.structure_title}>{s[AC.STRUCTURES_TITLE]}</div>
            {buildSimpleField(`${[AC.STRUCTURES]}~${[AC.STRUCTURES_DESCRIPTION]}`, false, null, false, s)}
            {this.getCoordinates(s)}
          </div>)
        )}
        </div>
      );
    }
    return null;
  }
}

export default Section(APStructures, 'Structures', true, 'APStructures');
